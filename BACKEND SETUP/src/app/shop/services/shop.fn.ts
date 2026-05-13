export const buildImageFromCloudinarySingle = (cloudinaryFiles: any[]) => {
  if (!cloudinaryFiles?.length) return undefined;
  const file = cloudinaryFiles[0];
  return {
    type: file.storageType === "cloudinary" ? "Cloudinary" : "Google",
    url: file.path,
    publicId: file?.cloudinaryKey,    // used to delete ,update, transformations, overwrite, generating url, 
    ...(file?.mimeType ? { mimeType: file.mimeType } : {}),
    ...(file?.mediaType ? { mediaType: file.mediaType } : {}),
    ...(file?.width ? { dimenstion: { width: file.width, height: file.height } } : {}), 
    ...(file?.height ? { dimenstion: {  width: file.width, height: file.height } } : {}), 
      ...(file?.width || file?.height ? {
        dimension: {
          ...(file?.height ? { height: file.height } : {}),
          ...(file?.width ? { width: file.width } : {}),
        },
      }
    : {}),
  };
};