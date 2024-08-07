const Users = require("../models/user")
const Wallets = require('../models/wallet')

class userService {
    userProfile = async (payload) => {
        try {
            const {_id} = payload

            const user = await Users.findOne({_id}).select(
                "-password - __v -accessToken"
            )
            return {
                status: "success",
                message: "user profile retrieved successfully",
                data: {user},
            }
        }catch (error) {
            console.log(error)
            return {
                status: "failed",
                message: "An unexpected error occured , try again later"
            }
        }
    }

    wallet = async (payload) => {
        try {
            const { _id } = payload;
      
            const wallet = await Wallets.findOne({ user: _id });
      
            return {
              status: "success",
              message: "wallet balance retrieved successfully",
              data: { wallet },
            };
          } catch (error) {
            console.log(error);
            return {
              status: "failed",
              message: "An unexpected error occurred, try again later",
            };
          }
    }
}

module.exports = new userService()