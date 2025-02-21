import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message, Col, Row } from "antd";
import { getAllExams } from "../../../apicalls/exams";
import { getAllReportsByUser } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import PageTitle from "../../../components/PageTitle";
import { useNavigate } from "react-router-dom";

function Quiz() {
  const [exams, setExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportsData, setReportsData] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const getExams = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllExams();
      if (response.success) {
        setExams(response.data.reverse());
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllReportsByUser();
      if (response.success) {
        setReportsData(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
    getExams();
  }, []);

  const verifyRetake = async (exam) => {
    try {
      dispatch(ShowLoading());
      const response = await getAllReportsByUser();
      // Calculate how many times the user attempted this exam
      const retakeCount = response.data.filter(
        (item) => item.exam && item.exam._id === exam._id
      ).length;
      console.log("Retake count for exam:", retakeCount);
      // Optionally you can check the retake count here and prevent further attempts
      // if (retakeCount >= 3) {
      //   message.error("Max attempts reached");
      //   dispatch(HideLoading());
      //   return;
      // }
    } catch (error) {
      message.error("Unable to verify retake");
      dispatch(HideLoading());
      return;
    }
    dispatch(HideLoading());
    navigate(`/user/write-exam/${exam._id}`);
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter exams based on search query
  const filteredExams = exams.filter(
    (exam) =>
      exam.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      exam.category?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      exam.class?.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const shouldRenderFilteredExams = filteredExams.length < exams.length;

  return (
    user && (
      <div>
        <PageTitle title={`Hi ${user.name}, Welcome it's time to study!!`} />
        <div className="divider"></div>
        <input
          type="text"
          className="w-25 mb-2"
          placeholder="Search exams"
          value={searchQuery}
          onChange={handleSearch}
        />
        {shouldRenderFilteredExams && (
          <div className="mb-2">
            <span>{`Filtered ${filteredExams.length} out of ${exams.length}`}</span>
          </div>
        )}
        <Row gutter={[16, 16]} style={{ marginLeft: 0, marginRight: 0 }}>
          {filteredExams.map((exam, index) => {
            // Check if a report exists for this exam by comparing exam._id
            const examReport = reportsData.find(
              (report) => report.exam && report.exam._id === exam._id
            );
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <div
                  style={{
                    backgroundColor:
                      examReport?.result?.verdict?.toLowerCase() === "fail"
                        ? "#ffc1b3"
                        :  examReport?.result?.verdict?.toLowerCase() === "pass" ? '#cfffb3':"aliceblue",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                  className="card-lg flex flex-col gap-1 p-2"
                >
                  <h1 className="text-2xl">{exam?.name}</h1>
                  <h1 className="text-md">Subject: {exam.category}</h1>
                  <h1 className="text-md">Class: {exam.class}</h1>
                  <h1 className="text-md">Total Marks: {exam.totalMarks}</h1>
                  <h1 className="text-md">
                    Passing Marks: {exam.passingMarks}
                  </h1>
                  <h1 className="text-md">Duration: {exam.duration}</h1>
                  <button
                    className="primary-outlined-btn"
                    onClick={() => verifyRetake(exam)}
                  >
                    Start Exam
                  </button>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    )
  );
}

export default Quiz;
