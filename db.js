const mongoose = require('mongoose')

const url = 'mongodb+srv://yashasva123:12345@cluster0.duc7m.mongodb.net/Coach?retryWrites=true&w=majority'

const connectDB = async ()=>{
    await mongoose.connect(url) 
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })
}

module.exports = connectDB;