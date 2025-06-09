const UserModel = require("../Model/UserModel");
const createOTPandTOken = require("../Util/CreateOTPandToken");
const SendMail = require("../Util/Mail");
require("dotenv").config();
let ejs = require('ejs');
let jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator')

const UserController = {

    Signup: async (request, response) => {
        let { UserName, Email, Password, ConfirmPassword, Phonenumber, Country } = request.body;

        if (!UserName) {
            return response.status(400).json({
                message: "Please enter your name",
                field: "UserName"
            });
        }
        if (!validator.isEmail(Email) || !Email.endsWith('@gmail.com')) {
            return response.status(400).json({
                message: "Please enter your email",
                field: "Email"
            });
        }
        if (!Password) {
            return response.status(400).json({
                message: "Please enter your password",
                field: "Password"
            });
        }
        if (!ConfirmPassword) {
            return response.status(400).json({
                message: "Please confirm your password",
                field: "ConfirmPassword"
            });
        }
        if (!Phonenumber) {
            return response.status(400).json({
                message: "Please enter your phone number",
                field: "Phonenumber"
            });
        }
        if (!Country) {
            return response.status(400).json({
                message: "Please select your country",
                field: "Country"
            });
        }

        if (ConfirmPassword !== Password) {
            return response.status(400).json({
                message: "Passwords do not match",
                field: "ConfirmPassword"
            });
        }
        if (request.body.role) {
            return response.status(400).json({
                message: "You cannot assign role permission",
                field: "role"
            });
        }

        try {
            let isExist = await UserModel.findOne({ Email });
            if (isExist) {
                return response.status(400).json({
                    message: "User already registered!",
                    field: "Email"
                });
            }

            let UserResult = await createOTPandTOken({ ...request.body }, process.env.PrivateKEY, "5m");

            let MailHTMLTemplte = await ejs.renderFile(__dirname + "/../views/Email.ejs", { OTP: UserResult.OTP });
            await SendMail(MailHTMLTemplte, Email, "OTP Verification !");

            return response.cookie("Verification_Token", UserResult.token).status(200).json({
                message: "OTP sent on your email."
            });
        } catch (error) {
            return response.status(500).json({
                message: error.message || "Internal Server Error"
            });
        }
    },
    Verify: async (request, response) => {
        let { Otp } = request.body

        if (!Otp) {
            return response.status(400).json({
                message: "Please Fill The OTP"
            })
        }
        try {
            let Token = request.cookies.Verification_Token
            const decoded = jwt.verify(Token, process.env.PrivateKEY);
            let { OTP, Userdata } = decoded
            if (Otp != OTP) {
                return response.status(400).json({
                    message: "Invaild OTP !"
                })
            }

            try {
                let hasePassword = await bcrypt.hash(Userdata.Password, 10);
                const user = await UserModel.create({ ...Userdata, Password: hasePassword }).sele;
                let mainHTMLTemplate = await ejs.renderFile(__dirname + "/../views/Confirmmessage.ejs");
                await SendMail(mainHTMLTemplate, Userdata.Email, "Confirmation message !");
                return response.status(201).json({
                    message: "User Create Successfully",
                    user
                })
            } catch (error) {
                return response.status(400).json({
                    message: error.message
                })
            }
        } catch (error) {
            return response.status(400).json({
                message: error.message
            })
        }


    },
    Signin: async (request, response) => {
        if (!request.body.Email) {
            return response.status(400).json({
                message: "Please fill the fields",
                field: "Email"
            });
        }

        if (!request.body.Password) {
            return response.status(400).json({
                message: "Please fill the fields",
                field: "Password"
            });
        }

        try {
            let isExist = await UserModel.findOne({ Email: request.body.Email });
            if (!isExist) {
                return response.status(404).json({
                    message: "Please First Signup",
                    field: "Email",
                });
            }

            let ValidPassword = await bcrypt.compare(request.body.Password, isExist.Password);

            if (!ValidPassword) {
                return response.status(401).json({
                    message: "invaild Password",
                    field: "Password"
                });
            }

            let { Password, ...rest } = isExist._doc;
            const { token } = createOTPandTOken({ ...rest }, process.env.SigninPrivateKey, "7d");

            if (!token) {
                return response.status(400).json({
                    message: "Invalid Token"
                });
            }

            return response.cookie("Access_Token", token,{httpOnly:true,maxAage:604800000}).status(200).json({
                message: "Login Successfull",
                ...rest
            });

        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },
    ForgetPasswordEmailVerify: async (request, response) => {
        if (!request.body.Email) {
            return response.status(400).json({
                message: "Please fill  the Email"
            })
        }
        try {

            let isExist = await UserModel.findOne({ Email: request.body.Email });
            if (!isExist) {
                return response.status(404).json({
                    message: "Invaild Email"
                })
            }
            let { token, OTP } = await createOTPandTOken(isExist, process.env.PrivateKEY, "5m");
            let MainHTMLTemplate = await ejs.renderFile(__dirname + "/../views/EMail.ejs", { OTP: OTP });
            await SendMail(MainHTMLTemplate, request.body.Email, "OTP Verification");
            return response.cookie("Verification_Token", token).status(200).json({
                message: "OTP Send Your Email"
            })

        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    VerifyOTP: async (request, response) => {
        let { Otp } = request.body;
        if (!Otp) {
            return response.status(400).json({
                message: "Please fill the OTP"
            })
        }
        let Token = request.cookies.Verification_Token
        try {
            let decoded = jwt.verify(Token, process.env.PrivateKEY);
            if (!decoded) {
                return response.status(404).json({
                    message: "Token Not Found"
                })
            }
            let { Userdata, OTP } = decoded;
            if (Otp != OTP) {
                return response.status(400).json({
                    message: "Invaild OTP"
                })
            }
            return response.status(200).json({
                message: "OTP Verified. You can now reset your password."
            })

        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    ResetPassword: async (request, response) => {
        let { Password } = request.body
        if (!Password) {
            return response.status(400).json({
                message: "Please fill the fields"
            })
        }
        let token = request.cookies.Verification_Token;
        if (!token) {
            return response.status(400).json({
                message: "Please Singup"
            })
        }
        try {
            let decoded = await jwt.verify(token, process.env.PrivateKEY);
            let { Userdata } = decoded
            let hassPasword = await bcrypt.hash(Password, 10);
            await UserModel.updateOne({ Email: Userdata.Email }, { $set: { Password: hassPasword } });
            let MainHTMLTemplate = await ejs.renderFile(__dirname + "/../views/ResetPasswordConfirm.ejs", { Message: "Password Reset" });
            await SendMail(MainHTMLTemplate, Userdata.Email, "Reset Password")
            return response.status(200).json({
                message: "Password Reset Successfull"
            })

        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    UpdateUserinfo: async (request, response) => {
        const UserId = request.params.id;
        if (!UserId) {
            return response.status(400).json({
                message: "Something went wrong!"
            });
        }

        if (UserId != request.User._id) {
            return response.status(403).json({
                message: "You can't access the data"
            })
        }

        if (!request.body.Street || !request.body.city || !request.body.state || !request.body.postalCode || !request.body.country) {
            return response.status(400).json({
                message: "Please fill the fields"
            })
        }

        try {

            let updatedUser = await UserModel.findByIdAndUpdate(UserId, {
                $set: {
                    Address: {
                        street: request.body.Street,
                        city: request.body.city,
                        state: request.body.state,
                        postalCode: request.body.postalCode,
                        country: request.body.country
                    }
                }
            }, { new: true })

            if (!updatedUser) {
                return response.status(400).json({
                    message: "Error While updateing Profile!"
                })
            }
            return response.status(200).json({
                message: "Address Add"
            })
        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    Userinfo: async (request, response) => {
        const UserId = request.params.id;
        if (!UserId) {
            return response.status(400).json({
                message: "Something went wrong!"
            });
        }

      

        try {
            let User = await UserModel.findById({ _id: UserId }).select("-Password -__v");
            if (!User) {
                return response.status(400).json({
                    message: "User Not Found!"
                })
            }
            return response.status(200).json({
                message: "User infomastion",
                User: User
            })
        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    Logout: async (request, response) => {
        try {
            return response.clearCookie("Access_Token").status(200).json({
                message: "Logged out successfull"
            })
        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    Getalluserinfo: async (request, response) => {
        try {
            let alluser = await UserModel.find();
            if (!alluser) {
                return response.status(400).json({
                    message: "User Not Found"
                })
            }
            return response.status(200).json({
                message: "All User",
                AllUser: alluser
            })

        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    }
}


module.exports = UserController;