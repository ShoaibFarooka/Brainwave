const mongoose = require('mongoose');

const forumQuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    replies: [
        {
            text: {
                type: String,
                required: true
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
                required: true
            },
            isVerified: {
                type: Boolean,
                default: false
            }
        }
    ],
},
    {
        timestamps: true,
    }
);

const forumQuestion = mongoose.model('forum-questions', forumQuestionSchema);

module.exports = forumQuestion;
