const ul = document.querySelector('.left-list');
const getBtn = document.querySelector("#search-btn");
const getButton = document.querySelector("#get-students");
const input = document.querySelector("input");
const div = document.querySelector(".searchedStudent");
const PassKey = "YouAreVerified";
const url = "http://localhost:3000/studentsDetails";
const logout = document.querySelector(".logout");

getButton.onclick = async () => {
    const response = await axios.get(url);
    const students = response.data;
    ul.innerHTML = "";
    for(let student of students) {
        const ulhtml = 
        `
        <li id = ${student._id}>
        <p> ${student.username} </p>
        <button class = "del"> Delete </button>
        <button class = "update"> Update </button>
        </li>
        `;
        ul.innerHTML += ulhtml;
    }
}

getBtn.onclick = async () => {
    const username = input.value;
    if(!username){
        alert("Enter User Name");
    }
    try {
        const response = await axios.get(`${url}/${username}`);
        const student = response.data;
        if(student.username === undefined) {
            div.innerHTML = `<p style = "color: red"> No Data Found <p>`;
        }
        div.innerHTML = `<p style = "color : green">Username: ${student.username} <i class="fa-solid fa-user-tie"></i>`;
    }
    catch(err) {
        console.log(err);
        
    }
}

document.addEventListener("click", async e => {
    const clickedDelButton = e.target.matches(".del");
    const clickedUpdateButton = e.target.matches(".update");

    if(clickedDelButton) {
        const li = e.target.parentElement;
        const idTodelete = li.id;
        
        var keyInput = prompt("Enter Authentication Key", "");
        if(keyInput === PassKey) {

            li.remove();

            try {
            await axios.delete(`${url}/${idTodelete}`);
            alert("Student Deleted");
            }catch(err) {
                console.log(err);
                alert("Couldn't Delete Student");
            }
        }else{
            alert("User Unverified");
        }
        
    }
    if(clickedUpdateButton) {
        var input = prompt("Enter updated username" ,'');
        const li = e.target.parentElement;
        const idToUpdate = li.id;
        if(!input) {
            alert("Enter valid username");
        }else{
           try{
            await axios.put(`${url}/${idToUpdate}/${input}`);
            alert("Username Updated");
            getButton.click();
        }catch(err) {
            console.log(err);
            alert("Could not update student");
        } 
        }
        
    }
})

