var admin = require("firebase-admin");
const signout = (req,res)=>{
        admin.auth().revokeRefreshTokens(req.userId)
        .then(()=>{
                console.log("refresh tokens revoked for ",req.userId)
                return res.status(200).send({message:"signed out "+req.userId})
        })
}
module.exports = signout