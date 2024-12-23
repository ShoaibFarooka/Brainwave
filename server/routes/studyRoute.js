const router = require("express").Router();
const Notes = require("../models/studyNotes");
const PastPapers = require("../models/studyPastPapers");
const Videos = require("../models/studyVideos");
const Books = require('../models/studyBooks');

// Fetch Study Content
router.post("/get-study-content", async (req, res) => {
    const { content, className, subject, schoolType = "secondary" } = req.body; 

    if (content === "default" || className === "default" || subject === "default") {
        return res.status(400).send("Invalid Data!");
    }

    try {
        const filter = { className, subject, schoolType }; 

        if (content === "study-notes") {
            const notes = await Notes.find(filter);
            if (notes.length > 0 && notes) {
                res.status(200).json(notes);
            } else {
                res.status(404).send("Notes Not Found");
            }
        }
        else if (content === "past-papers") {
            console.log(filter,"filter")
            const papers = await PastPapers.find(filter);
            if (papers.length > 0 && papers) {
                res.status(200).json(papers);
            } else {
                res.status(404).send("Papers Not Found");
            }
        }
        else if (content === "videos") {
            const videos = await Videos.find(filter);
            if (videos.length > 0 && videos) {
                res.status(200).json(videos);
            } else {
                res.status(404).send("Videos Not Found");
            }
        }
        else if (content === "books") {
            const books = await Books.find(filter);
            if (books.length > 0 && books) {
                res.status(200).json(books);
            } else {
                res.status(404).send("Books Not Found");
            }
        }
        else {
            res.status(400).send("Invalid Data!");
        }
    } catch (error) {
        console.log("Error while fetching study content: ", error);
        res.status(500).send("Internal Server Error");
    }
});


//Seed For Study Material

const saveNote = async () => {
    const Note = new Notes({
        className: '4',
        subject: 'Religion',
        title: 'r_test',
        schoolType : "primary",
        documentID: '1ae3f2diAVCP4ipqDc-4nvbu4u51aDvZE'
    });
    const savedNote = await Note.save();
    if (savedNote) {
        console.log('Note Saved');
    }
}

// saveNote();

const savePastPaper = async () => {
    const Paper = new PastPapers({
        className: '4',
        subject: 'English',
        title: 'resume',
        year: '2023',
        schoolType : "primary",

        documentID: '1BECPvz_RopF184M962FSLsM-cyc7uyYy'
    });
    const savedPaper = await Paper.save();
    if (savedPaper) {
        console.log('Paper Saved');
    }
}

// savePastPaper();

const saveVideo = async () => {
    const Video = new Videos({
        className: '4',
        subject: 'Science',
        title: 'f_s_test2',
        schoolType : "primary",

        videoID: 'H1YR5rsScC8'
    });
    const savedVideo = await Video.save();
    if (savedVideo) {
        console.log('Video Saved');
    }
}

// saveVideo();

const saveBook = async () => {
    const Book = new Books({
        className: '4',
        subject: 'English',
        title: 'Metaverse',
        year: '2021',
        schoolType : "primary",

        documentID: '1IvPoEFJzkplW7_BmWnB7iAJZ_5w1kfzH',
        thumbnail: 'https://picsum.photos/id/11/250',
    });
    const savedBook = await Book.save();
    if (savedBook) {
        console.log('Book Saved');
    }
}

// saveBook();


module.exports = router;

