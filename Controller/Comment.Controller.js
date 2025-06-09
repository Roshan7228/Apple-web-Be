const Commentmodel = require("../Model/CommentModel");



let Commentcontroller = {
    create: async (request, response) => {
        let { _id } = request.User;
        let { pid } = request.params;
        let { Comment } = request.body;
        try {
            let createCommet = await Commentmodel.create({ userid: _id, Productid: pid, Comment });
            return response.status(200).json({
                message: "Comment done",
                createCommet
            })
        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    Delete: async (request, response) => {
        let { userid, cid } = request.params;
        if (request.User._id !== userid) {
            return response.status(400).json({
                message: "Not Allow to delete Other User Message"
            })
        }

        try {
            let deletes = await Commentmodel.findByIdAndDelete({ _id: cid });
            if (!deletes) {
                return response.status(400).json({
                    message: "Not Found!"
                })
            }
            return response.status(200).json({
                message: "Delete successfully"
            })
        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    Update: async (request, response) => {
        let { userid, cid } = request.params;
        let { Comment } = request.body;
        if (request.User._id !== userid) {
            return response.status(400).json({
                message: "Not Allow to delete Other User Message"
            })
        }
        try {

            let Updatecomment = await Commentmodel.findByIdAndUpdate(cid, { $set: { ...request.body } }, { new: true });
            if (!Updatecomment) {
                return response.status(400).json({
                    message: "Not Found"
                })
            }
            return response.status(200).json({
                message: "Update Successfully",
                Updatecomment
            })
        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }


    },
    getallcommetonproduct: async (request, response) => {
        let { pid } = request.params;
        if (!pid) {
            return response.status(400).json({
                message: "Comment Not Fond"
            })
        }
        try {
            let allcommentonproduct = await Commentmodel.find({ Productid: pid });
            if (!allcommentonproduct) {
                return response.status(400).json({
                    message: "Not Found"
                })
            }

            return response.status(200).json({
                message: "All Comment",
                totalcomment: allcommentonproduct.length,
                allcommentonproduct
            })

        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    CommentLikeaction: async (request, response) => {
        let { userid } = request.params;
        if (request.User._id !== userid) {
            return response.status(403).json({
                message: 'You are not authorized to perform this action'
            });
        }
        let Comment = await Commentmodel.findById(request.params.cid);
        if (!Comment || Comment.length == 0) {
            return response.status(400).json({
                message: "Post Not Found"
            })
        }
        try {

            let index = Comment.CommentDetails.indexOf(userid);
            if (index === -1) {
                Comment.CommentDetails.push(userid);
                Comment.Commentlike += 1;
            } else {
                Comment.Commentlike -= 1;
                Comment.CommentDetails.splice(index, 1);
            }
            await Comment.save();
            return response.status(200).json({
                message: index === -1 ? "Comment liked" : "Comment unliked",
                totalLikes: Comment.Commentlike,
                CommentLikeDetails: Comment.CommentDetails
            })

        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    }
}
module.exports = Commentcontroller