const ProductModel = require("../Model/ProductModel");


let Productcontroller = {
    create: async (request, response) => {
        let { userid } = request.params;
        if (!request.body) {
            return response.status(400).json({
                message: "Please fill the fields"
            })
        }
        if (userid !== request.User._id) {
            return response.status(400).json({
                message: "You are not authorized"
            })
        }
        try {
            let images = [];
            if (request.files && request.files.length > 0) {
                request.files.forEach(file => {
                    images.push(file.filename);
                });
            }
            if (!request.files || request.files.length === 0) {
                return response.status(400).json({
                    message: "Image is required"
                });
            }

            if (request.files) {
                let ProductData = await ProductModel.create({
                    Userid: userid,
                    name: request.body.name,
                    category: request.body.category,
                    model: request.body.model,
                    description: request.body.description,
                    Price: request.body.Price,
                    image: images,
                    Camera: request.body.Camera,
                    FrontCamera: request.body.FrontCamera,
                    releasedate: request.body.releasedate,
                    space: {
                        display: request.body.display,
                        Processor: request.body.Processor,
                        storage: request.body.storage,
                        bettery: request.body.bettery,
                        otherfeature: request.body.otherfeature,
                        sortdescription: request.body.sortdescription
                    },
                    color: request.body.color
                });
                return response.status(200).json({
                    message: "Product add",
                    ProductData
                })

            }
        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    Update: async (request, response) => {
        let { userid, pid } = request.params;

        if (!userid || !pid) {
            return response.status(400).json({ message: "You are not authorized" });
        }

        if (request.User._id !== userid) {
            return response.status(403).json({ message: "You are not allowed to update this post" });
        }

        try {
            if (!request.files || request.files.length === 0) {
                const product = await ProductModel.findById(pid);
                if (!product) {
                    return response.status(404).json({ message: "Product not found" });
                }

                const { display, Processor, storage, bettery, otherfeature, ...rest } = request.body;

                const updatedData = {
                    ...rest,
                    space: {
                        display: display || product.space.display,
                        Processor: Processor || product.space.Processor,
                        storage: storage || product.space.storage,
                        bettery: bettery || product.space.bettery,
                        otherfeature: otherfeature || product.space.otherfeature
                    }
                };

                const updateproduct = await ProductModel.findByIdAndUpdate(
                    pid,
                    { $set: updatedData },
                    { new: true }
                );

                return response.status(200).json({
                    message: "Product updated successfully",
                    data: updateproduct
                });
            }
            if (request.files && request.files.length > 0) {
                const product = await ProductModel.findById(pid);
                if (!product) {
                    return response.status(404).json({ message: "Product not found" });
                }

                let { index, display, Processor, storage, bettery, otherfeature, ...rest } = request.body;

                if (index === undefined || index === null) {
                    return response.status(400).json({ message: "Index is required to update image" });
                }

                index = parseInt(index);
                if (isNaN(index) || index < 0 || index > 4) {
                    return response.status(400).json({ message: "Index must be between 0 and 4" });
                }
                product.image[index] = request.files[0].filename;

                const updatedData = {
                    ...rest,
                    space: {
                        display: display || product.space.display,
                        Processor: Processor || product.space.Processor,
                        storage: storage || product.space.storage,
                        bettery: bettery || product.space.bettery,
                        otherfeature: otherfeature || product.space.otherfeature
                    },
                    image: product.image
                };

                const updatedProduct = await ProductModel.findByIdAndUpdate(
                    pid,
                    { $set: updatedData },
                    { new: true }
                );

                return response.status(200).json({
                    message: `Image updated at index ${index} and other fields updated`,
                    data: updatedProduct
                });
            }
        } catch (error) {
            return response.status(500).json({ message: error.message });
        }
    },
    Delete: async (request, response) => {
        let { userid, pid } = request.params;

        if (!userid || !pid) {
            return response.status(400).json({ message: "You are not authorized" });
        }

        if (request.User._id !== userid) {
            return response.status(403).json({ message: "You are not allowed to update this post" });
        }

        try {
            let Deleteproduct = await ProductModel.findByIdAndDelete({ _id: pid })
            if (!Deleteproduct) {
                return response.status(400).json({
                    message: "Product Not Found"
                })
            }
            return response.status(200).json({
                message: "Product Delete Successfully"
            })

        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    AllProductget: async (request, response) => {
        let limit = request.query.limit || null;
        let order = request.query.order || "ace";
        let search = request.query.search || "";
        let page = request.query.page || null;
        try {
            let query = { name: { $regex: search, $options: "i" } };
            let Allproduct = await ProductModel.find(query).limit(limit).sort({ createdAt: order == 'desc' ? -1 : 1 }).skip(page);
            if (!Allproduct || Allproduct.length == 0) {
                return response.status(400).json({
                    message: "Post Not Found"
                });
            }
            return response.status(200).json({
                message: "All Product",
                Allproduct
            })


        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    },
    GetSingleProduct: async (request, response) => {
        let { pid } = request.params;
        try {
            let singleproduct = await ProductModel.findOne({ _id: pid });

            if (!singleproduct) {
                return response.status(400).json({
                    message: "Product Not Found"
                })
            }
            return response.status(200).json({
                message: "Product Fetch",
                singleproduct
            })
        } catch (error) {
            return response.status(500).json({
                message: error.message
            })
        }
    }
}


module.exports = Productcontroller