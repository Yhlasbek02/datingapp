import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 4},
    otp: {code: {type:Number}, expiryTime: {type:Date}},
    nickname: {type:String},
    location: {type:String},
    sex: {type:String},
    dateofBirth: {type:String},
    age: {type:Number},
    status: {type:String},
    height: {type:Number},
    weight: {type:Number},
    bodyType: {type:String},
    spokenLang: {type:Array, default: []},
    about: {type:String},
    verifying: {type:Boolean, default:false},
    image: {type:String},
    favourites: {type: Array, default: []},
    viewed: {type:Array, default: []},
    blockedUsers: {type: Array, default: []},
    coins: {type:Number, default:0},
    publicPhotos: {type:Array, default:[]},
    privatePhotos: {type:Array, default:[]},
    existPublic: {type:Boolean, default: false},
    existPrivate: {type:Boolean, default: false},
    geolocation: {
        type: {type: String, enum:['Point']},
        coordinates: {type:[Number]}
    },
    followers: {type:Array, default:[]},
    followedMe: {type:Array, default:[]},
    online: {type:Boolean, default:false},
},
{
    timestamps: true,
})

userSchema.index({geolocation:"2dsphere"});
const UserModel = mongoose.model("User", userSchema);

export default UserModel;