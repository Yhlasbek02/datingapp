import UserModel from "../models/User.js";

const userFiltering = async (req, res) => {
    const {distance, status, minAge, maxAge, spokenLang, bodyType, minHeight, maxHeight, publicMode, privateMode} = req.body;
    const currentUser = await UserModel.findById(req.user._id);
    const gender = req.user.sex;
    const longitude = parseFloat(currentUser.geolocation.coordinates[0])
    const latitude = parseFloat(currentUser.geolocation.coordinates[1])
    try {
        const filteredUsers = await UserModel.find({
            _id: {$not: {$eq: req.user._id}},
            geolocation: {
                $near: {
                  $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                  },
                  $maxDistance: distance,
                },
              },
            sex: {$not: {$eq: gender}},
            bodyType: {$in: [bodyType]},
            status: {$in: [status]},
            spokenLang: {$in: [spokenLang]},
            age: {
                $gte: minAge,
                $lte: maxAge
            },
            height: {
                $gte: minHeight,
                $lte: maxHeight
            },
            status: status,
            existPublic: publicMode,
            existPrivate: privateMode
        });
        console.log(filteredUsers);
        res.send(filteredUsers);
    } catch (error) {
        res.send({"message":"users not found"});
    }}

export default userFiltering;
