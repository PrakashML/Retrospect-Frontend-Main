import axios from 'axios';

class RetrospectService {
  loginUser(userData) {
    return axios.post("http://localhost:8080/login", userData);
  }

  getUserByToken(token) {
    return axios.get("http://localhost:8080/getbyJWT", {
      headers: {
        'token': token
      }
    });
  }

  register(userData) {
    return axios.post("http://localhost:8080/signup", userData)
  }

  getAllRooms(){
    return axios.get("http://localhost:8080/rooms")
  }

  createRoom(roomDetails) {
    return axios.post("http://localhost:8080/addrooms", roomDetails);
  }

  updateRoom(roomId, updatedRoomDetails) {
    return axios.put(`http://localhost:8080/updateRoom/${roomId}`, updatedRoomDetails);
  }

  getRoomById(roomId){
    return axios.put(`http://localhost:8080/getRoomById/${roomId}`)
  }

  updateUser(userId, updatedUserDetails) {
    return axios.put(`http://localhost:8080/update/${userId}`, updatedUserDetails);
  }

  resetPassword(resetPasswordData) {
    return axios.post("http://localhost:8080/resetpassword", resetPasswordData);
  }

  forgetPassword(emailData) {
    return axios.post("http://localhost:8080/forgot", emailData);
  }

  deleteMessageById(id){
    return axios.delete(`http://localhost:8080/message/delete/${id}`)
  }

  changePassword(change) {
      return axios.post("http://localhost:8080/change", change);
  }

  checkRoomAccessByEmail(data) {
    return axios.post("http://localhost:8080/rooms/check-access", data);
  }
}

const retro = new RetrospectService();
export default retro;
