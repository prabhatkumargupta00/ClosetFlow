const { ImageKit } = require('@imagekit/nodejs')

const imageKitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})

const uploadFile = async (file) => {
    const result = await imageKitClient.files.upload({
        file,
        fileName: "project_" + Date.now(),
        folder: 'project/Closetflow'
    })
    return result
}

module.exports = uploadFile