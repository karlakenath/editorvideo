import express from "express"
import cors from "cors"
import multer from "multer"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"

const app = express()
app.use(cors())
app.use(express.json())

const upload = multer({ dest: "uploads/" })

app.post("/highlight", upload.array("videos"), async (req, res) => {
  try {
    const files = req.files
    const fileList = files.map(f => f.path)

    const output = `result-${Date.now()}.mp4`

    const ffmpegCommand = ffmpeg()
    fileList.forEach(file => ffmpegCommand.input(file))

    ffmpegCommand
      .on("end", () => {
        res.download(output, () => {
          fileList.forEach(f => fs.unlinkSync(f))
          fs.unlinkSync(output)
        })
      })
      .on("error", err => res.status(500).json({ error: err.message }))
      .mergeToFile(output)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => console.log("API rodando na porta 3000"))
