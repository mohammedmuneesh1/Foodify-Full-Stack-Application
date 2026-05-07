import { NextFunction, Request, Response } from 'express';
import streamifier from 'streamifier';

//streamifier is a small Node.js library that lets you convert a Buffer (or string) into a Readable stream.
//Cloudinary’s upload_stream() method expects a stream of file data — not a Buffer or file path.
//But when you use middleware like multer (especially multer.memoryStorage()), you receive uploaded files in memory as buffers, like:

import cloudinary from '../../configs/cloudinaryConfig';




// fieldsFolderName = {
//   profileImage: "profile",
//   thumbnail: "thumbnail"
// }



// Middleware Factory: Accept dynamic folder name
const uploadToCloudinary = (
    folderName="test",
    // mediaType:string, //⚠️⚠️ MEDIATYPE IS NOT "MIMETYPE"  EX: 'userProfile'   ,"THUMBNAIL " //
     mediaType?:string, //⚠️⚠️ MEDIATYPE IS NOT "MIMETYPE"  EX: 'userProfile'   ,"THUMBNAIL " //
    fieldsFolderName?:Record<string,string>
) => {
    return async (req: Request, res: Response, next: NextFunction):Promise<void> => {
        let files: any[] = [];
        let isFieldsExist = false;


        if (req.file) {
            files = [req.file];
        } else if (Array.isArray(req.files)) {
            files = req.files;
        }
         else if (typeof req.files === 'object' && !Array.isArray(req.files)) {
            isFieldsExist = true;
            files = Object.values(req.files).flat();
        }

        if (files.length === 0) return next();

        try {
            const uploadedFiles = await Promise.all(
                files.map((file) => {

                    // return new Promise<{ public_id: string; url: string }>((resolve, reject) => {
                    return new Promise<any>((resolve, reject) => {
                        // console.log( `${process.env.CLOUDINARY_PARENT_FOLDER}/${folderName}`);

                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder:isFieldsExist && fieldsFolderName && fieldsFolderName[file.fieldname] ?  `${process.env.CLOUDINARY_PARENT_FOLDER}/${fieldsFolderName[file.fieldname]}` : `${process.env.CLOUDINARY_PARENT_FOLDER}/${folderName}`,  // Dynamically set folder
                            },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve({ 
                                    asset_id: result!.asset_id,
                                    //! result!.asset_id,  ! ! ! “I, the developer, know that result is not null or undefined at this point — trust me.”
                                    cloudinaryKey: result!.public_id,
                                    path: result!.secure_url,
                                     ...(result!.resource_type === 'image' && {
                                        width: result!.width,
                                        height: result!.height
                                     }),
                                     localFileName:file.originalname ?? "",
                                     uploadedFileName:result!.display_name ?? "",
                                     storageType:'cloudinary',
                                      mimeType: `${result!.resource_type}/${result!.format}`,
                                      mediaType: isFieldsExist && fieldsFolderName && fieldsFolderName[file.fieldname] ? fieldsFolderName[file.fieldname]  : mediaType ,
                                     });
                                // resolve(result ?? {});
                            }
                        );

                        streamifier.createReadStream(file.buffer).pipe(uploadStream);
                    });
                })
            );
            req.body.cloudinaryFiles = uploadedFiles;
            next();
        } catch (error) {
            console.error('Cloudinary upload error:', error);
        //    throw new Error ('Image upload to c failed.');
        next(error); //adv:👉 Express skips all remaining route/middleware logic ,And jumps directly to your global error handler, for example:
        }
    };
};

export default uploadToCloudinary;




// {
//   fieldname: 'image',
//   originalname: 'profile.png',
//   mimetype: 'image/png',
//   buffer: <Buffer ...>, // <— this is the raw binary data in memory
//   size: 15362
// }