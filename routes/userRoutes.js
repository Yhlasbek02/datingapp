import express from "express";
const router = express.Router();
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/auth-middlewares.js";
import path from "path";
import multer from "multer";
import UserModel from "../models/User.js";
import userFiltering from "../controllers/filterController.js";



const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb)=>{
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage});

router.use('/changepassword', checkUserAuth);
router.use('/writedesc', checkUserAuth);
router.use('/verify', checkUserAuth);
router.use('/resendotp', checkUserAuth);
router.use('/changedesc', checkUserAuth);
router.use('/profile', checkUserAuth);
router.use('/uploadimg', checkUserAuth);
router.use('/users', checkUserAuth);
router.use('/getuser/:id', checkUserAuth);
router.use('/users/:id/makefavourite', checkUserAuth);
router.use('/signout', checkUserAuth);
router.use('/makefav/:id', checkUserAuth);
router.use('/favourites/me', checkUserAuth);
// router.use('/users/blockuser/:id', checkUserAuth);
// router.use('/users/getblockeduser/:id', checkUserAuth);
router.use('/whoviewed', checkUserAuth);
router.use('/uploadpublic', checkUserAuth);
router.use('/uploadprivate', checkUserAuth);
router.use('/filtering', checkUserAuth);
router.use('/uploadimg', checkUserAuth);
router.use('/makefollow/:id', checkUserAuth);
router.use('/getfollow', checkUserAuth);
router.use('/deleteuser', checkUserAuth);
router.use('/getbasic', checkUserAuth);
router.use('/getstandart', checkUserAuth);
router.use('/getvip', checkUserAuth);


router.post('/register', UserController.userRegistration);
router.post('/login', UserController.userLogin);
router.post('/verify',UserController.verifyCode);
router.delete('/signout', UserController.signOut);
router.post('/resendotp', UserController.resendCode);
router.post('/writedesc', UserController.writeDesc);
router.post('/changepassword', UserController.changeUserPassword);
router.post('/changedesc', UserController.changeDesc);
router.get("/profile", UserController.profileInfo);

router.post("/uploadimg", upload.single("image"), async (req, res) => {
    try {
        const image = req.file.path
        await UserModel.findByIdAndUpdate(req.user._id, {$set: {
            image: image
        }})
        res.send({status:true, message: 'Image uploaded successfully'})    
    } catch (error) {
        console.log(error);
        res.send({status: false, message: "Image didn't uploaded "})
    }
    
})

router.post("/uploadpublic", upload.single("image"), async (req, res) => {
    try {
        const image = req.file.path;
        await UserModel.findByIdAndUpdate(req.user._id, {$push: {
            publicPhotos: image,
        }})
        await UserModel.findByIdAndUpdate(req.user._id, {existPublic:true})
        res.send({status:true, message: 'Public image was uploaded'})    
    } catch (error) {
        console.log(error);
        res.send({status:false, message:"Public image didn't uploaded"})
    }
    
})

router.post("/uploadprivate", upload.single("image"), async (req, res) => {
    try {
        const image = req.file.path
        await UserModel.findByIdAndUpdate(req.user._id, {$push: {
            privatePhotos: image,
        }})
        await UserModel.findByIdAndUpdate(req.user._id, {existPrivate:true})
        res.send({status:true, message: 'Private image was uploaded'})    
    } catch (error) {
        console.log(error);
        res.send({status:false, message:"Private image didn't uploaded"});
    }
})

router.get('/users', UserController.getAllUser);
router.get('/getuser/:id', UserController.getUser);
router.post('/makefav/:id', UserController.makeFavourite);
router.get('/favourites/me', UserController.getFavourites);
router.get('/whoviewed', UserController.whoViewed);
// router.post('/users/blockuser/:id', UserController.blockUser);
// router.get('/users/getblockeduser/:id', UserController.getBlockedUsers);
router.get('/', UserController.test);
router.get('/filtering', userFiltering);
router.post('/makefollow/:id', UserController.makeFollowing);
router.get('/getfollow', UserController.getFollowers);
router.delete('/deleteuser', UserController.deleteUser);
router.post('/getbasic', UserController.getBasic);
router.post('/getstandart', UserController.getStandart);
router.post('/getvip', UserController.getVip);
router.get('/test', UserController.hello);
export default router;