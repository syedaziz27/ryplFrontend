import firebase from "../firebase";
import React from "react";
import "./video.css";
import VideoRecorder from "react-video-recorder";
import serviceWorker from "../services/services";
import PropTypes from "prop-types";
import Annotations from "./annotation";
// import SpeechRecognition, {
//   StartAnontation,
//   StopAnontation
// } from "./annotation";
import AuthContext from "../contexts/auth";
import { Redirect } from "react-router-dom";

const uuid = require("uuid/v1");
const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  window.mozSpeechRecognition ||
  window.msSpeechRecognition)();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";

class Video extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      blob: null,
      videoUrl: "",
      upload: "",
      thumbnails: [],
      thumbnail: "",
      stopRecord: false,
      isRecording: false,
      preview: 0,
      recording: 0,
      categoryList: [],
      description: "",
      videoTitle: "",
      categoryId: null,
      annotation: null,
      responseTo: null,
      transcript: ""

    };
    this.videoPlayer = React.createRef();
  }

  static contextType = AuthContext;

  componentDidMount() {
    serviceWorker.getAllCategories().then(response => {
      this.setState(
        {
          categoryList: response.data.data
        },
        () => console.log(this.state.categoryList, "here")
      );
    });
  }

  submit = async () => {
    // console.log("fire");

    if(!this.state.blob && !this.state.upload.length){
      alert('Please either Upload or Record a Video')

    }
    else if(this.state.blob && this.state.upload){
      alert('Please choose to either  Upload or Record')
    }
    else if(this.state.blob){
      await this.handleFileStream();



    console.log(this.state);
    const { categoryId } = this.state;
    const {
      videoTitle,
      videoUrl,
      thumbnail,
      description,
      annotation,
      responseTo
    } = this.state;
    console.log(categoryId, videoTitle, videoUrl, thumbnail, description);

    serviceWorker
      .postVideo(
        1,
        categoryId,
        videoTitle,
        responseTo,
        videoUrl,
        thumbnail,
        annotation,
        description
      )
      .then(() => {
        console.log(
          "Video Posted",
          1,
          categoryId,
          videoTitle,
          responseTo,
          videoUrl,
          thumbnail,
          annotation,
          description
        );
      })
      .catch(err => {
        console.log(
          "Video Posted err",
          1,
          categoryId,
          videoTitle,
          responseTo,
          videoUrl,
          thumbnail,
          annotation,
          description
        );
      });

    }
    else if(this.state.upload){

      console.log(this.state);
      const { categoryId } = this.state;
      const {
        videoTitle,
        upload,
        thumbnail,
        description,
        annotation,
        responseTo
      } = this.state;
      console.log(categoryId, videoTitle, upload, thumbnail, description);
      

      serviceWorker
        .postVideo(
          1,
          categoryId,
          videoTitle,
          responseTo,
          upload,
          thumbnail,
          annotation,
          description
        )
        .then(() => {
          console.log(
            "Video Posted",
            1,
            categoryId,
            videoTitle,
            responseTo,
            upload,
            thumbnail,
            annotation,
            description
          );
        })
        .catch(err => {
          console.log(
            "Video Posted err",
            1,
            categoryId,
            videoTitle,
            responseTo,
            upload,
            thumbnail,
            annotation,
            description
          );
        });
    }

    //   userId,
    // categoryId,
    // title,
    // responseTo,
    // vidUrl,
    // thumbnailUrl,
    // annotation,
    // description
  };

  handleFileStream = async e => {
    console.log("check", this.context.uid, this.context);
    console.log("blob", this.state.thumbnail);

    if (!this.state.blob) return;

    const root = firebase.storage().ref();

    const videoUrl = root.child(`userVideos/${this.context.uid}/${uuid()}`);
    const thumbUrl = root.child(`userThumbnail/${this.context.uid}/${uuid()}`);

    try {
      const movie = await videoUrl.put(this.state.blob);
      const movieUrl = await movie.ref.getDownloadURL();
      const thumb = await thumbUrl.put(this.state.thumbnail);
      const thumbnailUrl = await thumb.ref.getDownloadURL();
      console.log("urls", movieUrl, thumbnailUrl);
      this.setState({
        videoUrl: movieUrl,
        thumbnail: thumbnailUrl
      });
    } catch (err) {
      console.log("error", err);
    }
  };

  handleFileInput = async e => {
    const firstFile = e.target.files[0];

    const root = firebase.storage().ref();
    const newImage = root.child(`uploads/${uuid()}/${firstFile.name}`);

    try {
      const snapshot = await newImage.put(firstFile);
      const url = await snapshot.ref.getDownloadURL();
      console.log(url);
      this.setState({
        upload: url
      });
      console.log(url);
    } catch (err) {
      console.log(err);
    }
  };

  handleFileInputThumbnail = async e => {
    const firstFile = e.target.files[0];

    const root = firebase.storage().ref();
    const newImage = root.child(`uploads/thumbnail/${uuid()}/${firstFile.name}`);

    try {
      const snapshot = await newImage.put(firstFile);
      const url = await snapshot.ref.getDownloadURL();
      console.log(url);
      this.setState({
        thumbnail: url
      });
      console.log(url);
    } catch (err) {
      console.log(err);
    }
  };

  preview = () => {
    if (this.state.preview === 0) {
      this.setState({
        preview: 1
      });
    } else {
      this.setState({
        preview: 0
      });
    }
  };

  setBlob = (videoblob, thumb) => {
    this.setState({
      blob: videoblob,
      thumbnail: thumb
    });
    console.log("thumbnail", thumb, videoblob);
  };

  resetBlob = () => {
    this.setState({
      blob: null
    });
  };

  reset = () => {
    console.log('newTesting')
    console.log("hira1234", this.state.func);
    if (this.state.recording === 0) {
      this.setState({
        recording: 1
      });
    } else if (this.state.recording === 1) {
      this.setState({
        recording: 0
      });
    }
  };

  handleDescription = e => {
    console.log(e.currentTarget.value);
    this.setState({
      description: e.currentTarget.value
    });
  };

  handleTitle = e => {
    console.log(e.currentTarget.value);
    this.setState({
      videoTitle: e.currentTarget.value
    });
  };

  handleCategory = e => {
    console.log("jello", e.currentTarget.value);
    this.setState({ categoryId: e.currentTarget.value });
  };


  
  render() {
    console.log("context", this.context);
    return !this.context ? (
      <Redirect to="/login" />
    ) : this.state.categoryList.length === 0 ? (
      <div>Loading</div>
    ) : (
      <>
        <div className="entire-video-page">
          <div className="video-record-left-panel">
            <VideoRecorder
              onRecordingComplete={(
                videoblob,
                startedAt,
                thumbnailBlob,
                duration
              ) => {
                console.log(videoblob);
                console.log("thumb", thumbnailBlob);
                console.log(URL.createObjectURL(videoblob));
                this.setBlob(videoblob, thumbnailBlob);

                // const storageRef = firebase.storage().ref();
                // const ref = storageRef.child("test/test.mp4");

                // ref.put(videoblob).then(function(snapshot) {
                //   console.log("Uploaded a blob or file!", snapshot);
                // });
              }}
              isOnInitially={false}
              OnTurnOnCamera={console.log("hiya")}
              onTurnOnCamera={console.log("hiya1")}
              onTurnOffCamera={console.log("hiya2")}
              onStartRecording={() => {this.reset()}}
              onStopRecording={() => {
                this.reset();
                this.setBlob();
                return null;
              }}
              // onRecordingComplete={console.log('hiya4.5')
              // }
              onOpenVideoInput={console.log("hiya5")}
              onStopReplaying={console.log("hiya6")}
            />
          </div>
          {/* <div
              className="annotation"
              style={{ opacity: `${this.state.preview}` }}
            > */}
          {/* <SpeechRecognition
              name={"Daniel"}
              annotations={this.startAnnontations}
            />
            <StartAnontation
              startAnnontations={this.state.func}
              name={"Daniel"}
            /> */}
          {/* {<Annotations />} */}
          {/* <StopAnontation annotationState={this.state.startingAnnontations}  func={this.handleReset} reset={this.state.func} name={'Daniel'} />  */}

          {/* ----RIGHT PANEL OF THE PAGE START HERE----- */}
          <div className="handle-record-right-panel">
            <div className="handle-title">
              <div className="form-title">Title</div>
              <input
                className="input-form"
                type="text"
                onChange={e => this.handleTitle(e)}
                placeholder="Enter a title..."
                name="title"
              />
            </div>
            <div className="handle-description">
              <div className="form-title">Description</div>
              <input
                className="input-form"
                type="text"
                placeholder="Include a description..."
                onChange={e => this.handleDescription(e)}
                name="description"
              />
            </div>
            <div className="handle-category-dropdown">
              <div className="form-title">Category</div>
              <select
                id="inputState"
                className="select-dropdown"
                // defaultValue="Choose.."
                defaultValue={this.state.category}
                onChange={this.handleCategory}
              >
                <option>Select</option>
                {this.state.categoryList.map((e, i) => {
                  return (
                    <option key={i} value={e.id}>
                      {e.name}
                    </option>
                  );
                })}
              </select>
            </div>
            {/* <div className="annotation-box"> */}
            {/* <button style={{ padding: "10px" }} onClick={this.preview}>
                  <div>Preview Annotations</div>
                </button> */}

            {/* <div style={{ opacity: `${this.state.preview}` }}> */}
            {/* <SpeechRecognition
                  name={"Daniel"}
                  annotations={this.startAnnontations}
                />
                <StartAnontation
                  startAnnontations={this.state.func}
                  name={"Daniel"}
                /> */}
            {/* <StopAnontation annotationState={this.state.startingAnnontations}  func={this.handleReset} reset={this.state.func} name={'Daniel'} />  */}
            {/* </div> */}
            {/* </div> */}

            <div className="upload-btn-wrapper">
              <h3 style={{ textAlign: "left", marginLeft: "30" }}>
                Choose a video from my computer
              </h3>
              <div className="upload-btn">
                <input
                  type="file"
                  name="myfile"
                  onChange={e => this.handleFileInput(e)}
                  onClick={this.getFirebasetoken}
                  style={{
                    fontSize: "16px",
                    borderRadius: "5px",
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#292D33",
                    border: "1px solid #292D33 ",
                    color: "white",
                    fontSize: "20px",
                    fontWeight: "700"
                  }}
                />
              </div>
              <div className="upload-btn">
                {" "}
                {/* <button
                  style={{
                    fontSize: "16px",
                    borderRadius: "5px",
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#292D33",
                    border: "1px solid #292D33 ",
                    color: " white",
                    fontSize: "20px",
                    fontWeight: "700"
                  }}
                  onClick={this.stopRecording}
                >
                  Upload File
                </button> */}
              <h3 style={{ textAlign: "left" }}>
                Choose a thumbnail from my computer
              </h3>               
               <input
                  type="file"
                  name="myfile"
                  onChange={e => this.handleFileInputThumbnail(e)}
                  onClick={this.getFirebasetoken}
                  style={{
                    fontSize: "16px",
                    borderRadius: "5px",
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#292D33",
                    border: "1px solid #292D33 ",
                    color: "white",
                    fontSize: "20px",
                    fontWeight: "700"
                  }}
                  />
              </div>
            </div>
            <div className="submit-btn-wrapper">
              <button
                style={{
                  border: "1px solid black",
                  borderRadius: "5px",
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#2a2d34",
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "700"
                }}
                onClick={this.submit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
        <Annotations recording={this.state.recording} />
      </>
    );
  }
}

export default Video;
