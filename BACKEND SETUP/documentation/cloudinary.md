export async function UPLOAD_RESUME_COVER_IMAGE_CONTROLLER(req:Request,res:Response){
    try {
        
        const userId = req.user?.uId;
        const resumeId  = req.params.resumeId;
        if(!resumeId || !isValidObjectId(resumeId)){
            ResponseHandler(res,200,false,null,'Invalid resume id.');
            return;
        }
        if(!userId) {
             ResponseHandler(res,200,false,null,'User not found.');
            return;
            }
          const cloudinaryFiles  = req.body?.cloudinaryFiles;

          // console.log('cloudinaryFiles',cloudinaryFiles);

         if (!Array.isArray(cloudinaryFiles) || cloudinaryFiles.length === 0) {
              ResponseHandler(res,200,false,null,'No file found.');
              return;
            }
    
          const cloudinaryDBuploadData = [];

          const deleteFiles={
            thumbnail:false,
            profile:false
          };
    
          for (let val of cloudinaryFiles) {

            if( val?.mediaType === "profile" || val?.mediaType === "thumbnail"){
                // const await cloudinary.uploader.destroy(val?.cloudinaryKey);
                deleteFiles[val?.mediaType as 'thumbnail'|'profile'] = true
            }

            cloudinaryDBuploadData.push({
                userId:userId,
                path:val?.path,
                isPrivate:true,
                localFileName:val?.localFileName,
                uploadedFileName:val?.uploadedFileName,
                storageType:val?.storageType,
                mimeType:val?.mimeType,
                mediaType:val?.mediaType,
                cloudinaryKey:val?.cloudinaryKey,
            });
          }
          const media = await MediaModel.create(cloudinaryDBuploadData);
          //⚠️⚠️⚠️ WE ONLY PASS THE MEDIA ID TO THE RESUME MODEL⚠️⚠️⚠️
    
        // return ResponseHandler(res,200,true,null,"cover Image uploaded successfully.");
    
        
      ResponseHandler(res, 200, true, {
        thumbNail:media?.filter (val => val?.mediaType === 'thumbnail'&& val?.storageType === 'cloudinary')?.[0]?.path,
        profilePreviewUrl:media?.filter (val => val?.mediaType === 'profile'&& val?.storageType === 'cloudinary')?.[0]?.path,
    }, "Cover image uploaded successfully.");
    
      // 🔥 Background cleanup (NON-BLOCKING)
      setImmediate(async () => {
        try {

            const resume = await ResumeModel.findOne({ userId: userId });
      const deletePath = [
     deleteFiles?.profile ? resume?.profileInfo?.profilePreviewUrl : null,
     deleteFiles?.thumbnail ? resume?.thumbnailLink : null,
  ].filter((path): path is string => Boolean(path));


            const deleteMediaData = await MediaModel.find({
                userId: userId,
                path:{
                    $in:deletePath
                }
            });
            
          await Promise.all(
      deleteMediaData.map(val => deleteFromCloudinary(val.cloudinaryKey!))
    );


            await MediaModel.deleteMany({
                userId: userId,
                path:{$in:deletePath}
            });
        } catch (error) {
          console.error("Failed to delete old image:", error);
        }
      });
      
      return;

    } catch (error) {
         ErrorHandler(res,error,"UPLOAD_RESUME_COVER_IMAGE_CONTROLLER");
    }    


}  