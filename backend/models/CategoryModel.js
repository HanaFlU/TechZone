const mongoose = require("mongoose");

const testCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        default: ""
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestCategory",
        default: null
    },
    icon: {
        type: String,
        default: ""
    },
    specifications: [
        {
            type: Object,
            properties: {
                key: { type: String, required: true },
                label: { type: String, required: true },
            },
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model("TestCategory", testCategorySchema);
