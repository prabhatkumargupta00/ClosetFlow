const { ImageKit } = require('@imagekit/nodejs')

const imageKitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})

const uploadFile = async (file) => {
    try {
        const result = await imageKitClient.files.upload({
            file,
            fileName: "project_" + Date.now(),
            folder: 'project/Closetflow'
        })
        console.log('ImageKit upload successful:', result);
        return result;
    } catch (error) {
        console.error('ImageKit upload failed:', error);
        throw error;
    }
}

const deleteFile = async (fileId) => {
    try {
        const result = await imageKitClient.files.delete(fileId);
        console.log('ImageKit delete successful:', result);
        return result;
    } catch (error) {
        console.error('ImageKit delete failed:', error);
        throw error;
    }
}

module.exports = { uploadFile, deleteFile }