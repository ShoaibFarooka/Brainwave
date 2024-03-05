import { message, Table } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllUsers,blockUserById } from "../../../apicalls/users";
import PageTitle from "../../../components/PageTitle";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = React.useState([]);
  const dispatch = useDispatch();

  const getUsersData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllUsers();
      dispatch(HideLoading());
      if (response.success) {
        setUsers(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  const blockUser = async (studentId) => {
    try {
      dispatch(ShowLoading());
      const response = await blockUserById({
        studentId,
      });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getUsersData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

 
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "School",
      dataIndex: "school",
    },
    {
      title: "Class",
      dataIndex: "class",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <div className="flex gap-2">
          
          <i
            className="ri-delete-bin-line"
            onClick={() => blockUser(record._id)}
          ></i>
        </div>
      ),
    },
  ];
  useEffect(() => {
    getUsersData();
  }, []);
  return (
    <div>
      <div className="flex justify-between mt-2 items-end">
        <PageTitle title="Users" />
      </div>
      <div className="divider"></div>

      <Table columns={columns} dataSource={users} />
    </div>
  );
}

export default Users;