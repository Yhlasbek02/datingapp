import UserModel from "../models/User.js";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import otpGenerator from "otp-generator";
import fs from "fs";
import path from "path";



let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth:{
        user: 'datingappotp2023@gmail.com',
        pass: 'buxtkrasctlwepbq',
    }
});



class UserController {
    static test = async(req, res) => {
        res.send('Hello from server');
    }

    static hello = async(req, res) => {
        res.send('Hello everyone');
    }
    
    static userRegistration = async (req, res) => {
        const {email, password, password_confirmation} = req.body;
        const user = await UserModel.findOne({email:email});
        if(user){
            res.send({status:false, message:"Email already exists, login instead"});
        }else {
            if(email && password && password_confirmation){
                if (password.length > 4) {
                    if (password ===password_confirmation){
                        try {
                            const salt = await bcryptjs.genSalt(10)
                            const hashPassword = await bcryptjs.hash(password, salt)
                            const doc = new UserModel({
                                email: email,
                                password: hashPassword,
                                verifying: false,
                                
                            })
                            await doc.save()
                            const saved_user = await UserModel.findOne({email:email})
                            const token = jwt.sign({userID:saved_user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '5d'});
                            const otp = otpGenerator.generate(4, {digits:true, upperCaseAlphabets:false, specialChars:false, lowerCaseAlphabets:false});
                            const expiryTime = new Date(Date.now()+1*60*1000);
                            await UserModel.findOneAndUpdate({email:email}, {$set: {
                                otp: {
                                    code: otp,
                                    expiryTime: expiryTime
                                }
                            }})
                            console.log(otp);
                            var mailOptions = {
                                from: "datingappotp2023@gmail.com",
                                to: req.body.email,
                                subject: "otp registration",
                                html: "<h3>Verification code is </h3>" + "<h1>"+ otp +"</h1>" + "<h3>verification code expires 5 minutes</h3>"
                            };
                            transporter.sendMail(mailOptions, (error, info) =>{
                                if (error){
                                    return console.log(error);
                                }
                                console.log('====================================');
                                console.log('message sent: %s', info.messageId);
                                console.log('preview url: %s', nodemailer.getTestMessageUrl(info));
                                res.render('otp');
                            });
                            res.send({status:true, message:"Please verify email", "token": token})
                        } catch (error) {
                            console.log('====================================');
                            console.log(error);
                            console.log('====================================');
                            res.send({status:false, message:"unable to register"})
                        }
                    } else {
                        res.send({status:false,message:"Password and password confirm not match"})
                    }
                    
                } else {
                    res.send({status:false, message:"Password must be more than 4 characters"})
                }
                
            } else {
                res.send({status:false, message:"All fields are required"})
            }
        }
    }

    static verifyCode = async(req, res) => {
        const verificationCode = await UserModel.findById(req.user._id);
        const {otp} = req.body;
        const code = verificationCode.otp.code;
        if (verificationCode.otp.expiryTime > new Date(Date.now())) {
            if (otp==code){
                await UserModel.findByIdAndUpdate(req.user._id, {
                    verifying: true,
                });
                res.send({status:true, message: "Email verification is successfull"});
            }
            else {
                res.send({status:false, message:"Otp code is wrong, please try it again"});
            }    
        } else {
            res.send({status:false, message:"Verification code was expired! Please resend it again."})
        }
    }

    static resendCode = async(req, res) => {
        const newOTP = otpGenerator.generate(4, {digits:true, upperCaseAlphabets:false, specialChars:false, lowerCaseAlphabets:false});
        const newExpiryTime = new Date(Date.now()+1*60*1000);
        await UserModel.findByIdAndUpdate(req.user._id, {$set: {
            otp: {
                code: newOTP,
                expiryTime: newExpiryTime
            }
        }});
        console.log(newOTP)
        try {
            var mailOptions = {
                from: "datingappotp2023@gmail.com",
                to: req.user.email,
                subject: "otp registration",
                html: "<h3>Verification code is </h3>" + "<h1>"+ newOTP +"</h1>"
            };

            transporter.sendMail(mailOptions, (error, info) =>{
                if (error){
                    return console.log(error);
                }
                console.log('====================================');
                console.log('message sent: %s', info.messageId);
                console.log('preview url: %s', nodemailer.getTestMessageUrl(info));
                res.render('otp');
            });
            res.send({status:true, message:"Verification code sent, please confirm email"})
        } catch (error) {
            res.send(error);
            console.log(error);
        }
    }

    static userLogin = async (req, res) => {
        try {
            const {email, password} = req.body
            if (email && password){
                const user = await UserModel.findOne({email:email})
                if(user != null){
                    if (user.verifying === true) {
                        const isMatch = await bcryptjs.compare(password, user.password)
                        if((user.email === email) && isMatch){
                            const token = jwt.sign({userID:user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '5d'});
                            res.send({status:true, message:"Login success", "token":token})
                        }else{
                            res.send({status:true, message:"Email or password is not valid"})
                        }
                    } else {
                        res.send({status:false, message:"Your email was not verified"})
                    }
                }else {
                    res.send({status:false, message:"You are not registered or verified user"})
                }
            }else {
                res.send({status:false, message: "All fields are required"})
            }
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            res.send({status:false, message: "Something went wrong"})
        }
    }

    static signOut = (req, res) => {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token)
        try {
            res.send({status:true, message:"Logout successfully"});  
        } catch (error) {
            console.log(error);
            res.send({status:false, message:"Something went wrong"});
        }

    };

    static deleteUser = async (req, res) => {
        
        try {
            await UserModel.findByIdAndDelete(req.user._id);
            res.send({status: true, message: "User was deleted"})    
        } catch (error) {
            console.log(error);
            res.send({status:false, message:"Something went wrong"})            
        }
    }

    static writeDesc = async (req, res) => {
        function calculateAge(birthday) {
            const birthDate = new Date(birthday);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff<0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age --
            }
            return age;
        }
        try {
            const {nickname, location, sex, dateofBirth, status, height, weight, bodyType, spokenLang, about, latitude, longtitude} = req.body;
            if (nickname && location && sex && dateofBirth && status && height && weight && bodyType && spokenLang && about && latitude && longtitude) {
                const age = calculateAge(dateofBirth);
                const Latitude = parseFloat(latitude);
                const Longitude = parseFloat(longtitude);
                const Height = parseFloat(height);
                const Weight = parseFloat(weight);
                console.log(age);
                await UserModel.findByIdAndUpdate((req.user._id), {$set:{
                    nickname: nickname,
                    location: location,
                    sex: sex,
                    dateofBirth: dateofBirth,
                    age: age,
                    status: status,
                    height: Height,
                    weight: Weight,
                    bodyType: bodyType,
                    spokenLang: spokenLang,
                    about: about,
                    geolocation: {
                        type: 'Point',
                        coordinates: [Longitude, Latitude]
                    }
                }});
                res.send({status:true, message:"Almost done, upload your image"});
            } else {
                res.send({status:false,message:"All fields are required"})
            }
        } catch (error) {
            console.log(error);
            res.send({status:false, message:"Something went wrong"});
        }
    }

    static uploadImage = async (req, res) => {
        const {path} = req.body;
        const imageBuffer = fs.readFileSync(path);
        const image = new Image({
            name: 'my image',
            data: imageBuffer,
            owner: req.user._id
        });

        image.save(function(err, result){
            if (err) throw err;
            console.log('image saved successfully');
        })
    }

    static changeUserPassword = async (req, res) => {
        const {currentpassword, password, password_confirmation} = req.body;
        const user = await UserModel.findById(req.user._id);
        const isMatch = await bcryptjs.compare(currentpassword, user.password)
        if(isMatch){
            if(password && password_confirmation) {
                if (password !==password_confirmation) {
                    res.send({status:false,message:"password and password confirmation are not match"});
                } else {
                    const salt = await bcryptjs.genSalt(10)
                    const newHashPassword = await bcryptjs.hash(password, salt);
                    await UserModel.findByIdAndUpdate(req.user._id, {$set: {password: newHashPassword}})
                    res.send({status:true, message:"password changed successffully"});
                }
            } else {
                res.send({status:false, message:"All fields are required"});
            }
        }else{
            res.send({status:false,message:"Current password is wrong"})
        }
    }        

    static changeDesc = async (req, res) => {
        try {
            const {nickname, location, sex, dateofBirth, status, height, weight, bodyType, spokenLang, about, latitude, longtitude} = req.body;
            if (nickname && location && sex && dateofBirth && status && height && weight && bodyType && spokenLang && about && latitude && longtitude) {
                const Height = parseFloat(height);
                const Weight = parseFloat(weight);
                await UserModel.findByIdAndUpdate((req.user._id), {$set:{
                    nickname: nickname,
                    location: location,
                    sex: sex,
                    dateofBirth: dateofBirth,
                    status: status,
                    height: Height,
                    weight: Weight,
                    bodyType: bodyType,
                    spokenLang: spokenLang,
                    about: about,
                    geolocation: {
                        type: 'Point',
                        coordinates: [longtitude, latitude]
                    }
                }});
                res.send({status:true, message:"Changing descriptions is successfull"});
            } else {
                res.send({status:false,message:"All fields are required"})
            }
        } catch (error) {
            console.log(error);
            res.send({status:false, message:"Something went wrong"});
        }
    }

    static profileInfo = async (req, res) => {
        const id = req.user._id;
        try {
            const user = await UserModel.findById(id);
            
            res.status(200).json({user});
            console.log(user)
        } catch (error) {
            console.log(error);
            res.send({status: false, message:"User not found"});
        }
    }
    
    static getAllUser = async (req, res) => {        
        const sex = req.user.sex;
        try {
           const users = await UserModel.find({
            sex: {$not: {$eq: sex}}
           }).limit(14);
           
           res.send({users});
           console.log(users);
        } catch (error) {
            console.log(error)
        }        
    }
    
    static getUser = async (req, res) => {
        try {
            const id = req.params.id;
            const user = await UserModel.findById(id);
            let followStatus;
            if(!user) {
                return res.status(404).json({message: 'user not found'});
            }
            if(!user.viewed.includes(req.user._id)){
                await UserModel.updateMany({_id:req.params.id}, {$push: {viewed: req.user._id}})
            }
            if(!user.followers.includes(req.user._id)){
                res.send({"_id":user._id, "nickname":user.nickname,"email":user.name, "spokenLang":user.spokenLang, "favourites":user.favourites, "viewed":user.viewed, "coins":user.coins, "publicPhotos":user.publicPhotos, "privatePhotos":user.privatePhotos, followStatus:false })
            } else {
                res.send({"_id":user._id, "nickname":user.nickname,"email":user.name, "spokenLang":user.spokenLang, "favourites":user.favourites, "viewed":user.viewed, "coins":user.coins, "publicPhotos":user.publicPhotos, "privatePhotos":user.privatePhotos, followStatus: true })
            }

        } catch (error) {
            return console.log(error);
        }
    }

    static makeFavourite = async (req, res) => {
        try {
            const user = await UserModel.findById(req.user._id);
            const favouriteUser = await UserModel.findById(req.params.id)
            if (!user.favourites.includes(favouriteUser._id)){
                user.favourites.push(favouriteUser._id);
                await user.save();
            }
            res.send({status: true, message:"User added to favourites"});
        }
        catch (error) {
            console.log(error);
            res.send({status:false, message:"User wasn't added"});
        }
    }

    static getFavourites = async (req, res) => {
        try {
            const user = await UserModel.findById(req.user._id);
            const favourites = await UserModel.find({_id: {$in: user.favourites}});
            res.send(favourites);     
        } catch (error) {
            console.log(error);
            res.status({status:false, message:"No favourited users"})
        }   
    }

    static makeFollowing = async (req, res) => {
        try {
            const user = await UserModel.findById(req.user._id);
            const followingUser = await UserModel.findById(req.params.id)
            if (!user.followers.includes(followingUser._id)){
                user.followers.push(followingUser._id);
                await user.save();
                followingUser.followedMe.push(user._id);
                await followingUser.save();
            }
           
            res.send({status: true, message:"User followed"});
        }
        catch (error) {
            console.log(error);
            res.send({status:false, message:"User wasn't followed"});
        }
    }

    static getFollowers = async (req, res) => {
        try {
            const user = await UserModel.findById(req.user._id);
            const followed = await UserModel.find({_id: {$in: user.followers}});
            res.send(followed);
        } catch (error) {
            console.log(error);
            res.status({status: false, message: "No followed users"});
        }
    }

    static whoViewed = async (req, res) => {
        try {
            const user = await UserModel.findById(req.user._id);
            const whoView = await UserModel.find({_id: {$in: user.viewed}});
            res.send(whoView);     
        } catch (error) {
            console.log(error);
            res.status({status:false, message:"No viewed users"})
        }  
    }

    static blockUser = async (req, res) => {
        try {
            const id = req.params.id;
            if(!req.user.blockedUsers.includes(id)){
                await UserModel.updateMany({_id: req.user._id}, {$push: {blockedUsers: id}})
                res.send({status:true, message:"contact blocked"});
            }else{
                await UserModel.updateMany({_id: req.user._id}, {$pull: {blockedUsers: id}})
                res.send({status:true, message:"contact unblocked"});
            }
        } catch (error) {
            console.log(error);
            res.send({status:false,message:"blocking user is failed"})
        }
    }

    static getBlockedUsers = async (req, res) => {
        const toId = mongoose.Types.ObjectId;
        try {
            const id = toId(req.params.id);
            const user = await UserModel.findById(id);
            const blocked = await Promise.all(
                user.blockedUsers.map((blockId) => {
                    const blockedId = toId(blockId)
                    return UserModel.findById(blockedId);
                })
            );
            let blockedList = [];
            blocked.map((whoblock) => {
                const {_id, email, nickname, image} = whoblock;
                blockedList.push({_id, email, nickname, image})
            })
            res.status(200).json(blockedList);  
        } catch (error) {
            console.log(error);
            res.send({message:"unable to get users"})
        }
    }

    static getBasic = async(req, res) => {
        try {
            const basicCoin = 50;
            await UserModel.findByIdAndUpdate(req.user._id, {$inc: {coins: basicCoin}});
            res.send({status:true, message: "50 coins added"});
        } catch (error) {
            console.log(error);
            res.send({status:false, message: "Coins wasn't added"})
        }
    }

    static getStandart = async(req, res) => {
        try {
            const basicCoin = 150;
            await UserModel.findByIdAndUpdate(req.user._id, {$inc: {coins: basicCoin}});
            res.send({status:true, message: "150 coins added"});
        } catch (error) {
            console.log(error);
            res.send({status:false, message: "Coins wasn't added"})
        }
    }

    static getVip = async(req, res) => {
        try {
            const basicCoin = 250;
            await UserModel.findByIdAndUpdate(req.user._id, {$inc: {coins: basicCoin}});
            res.send({status:true, message: "250 coins added"});
        } catch (error) {
            console.log(error);
            res.send({status:false, message: "Coins wasn't added"})
        }
    }
};


export default UserController;