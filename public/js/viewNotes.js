let googleUserId;

window.onload = (event) => {
    // Use this to retain user state between html pages.
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log('Logged in as: ' + user.displayName);
            googleUserId = user.uid;
            getNotes(googleUserId);
        } else {
            // If not logged in, navigate back to login page.
            window.location = 'index.html';
        };
    });
};

const getNotes = (userId) => {
    const notesRef = firebase.database().ref(`users/${userId}`);
    notesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        renderDataAsHtml(data);
    });
};

const renderDataAsHtml = (data) => {
    let cards = ``;
    for (const noteItem in data) {
        // console.log(data[noteItem].title[0])
        const note = data[noteItem];
        // For each note create an HTML card
        cards += createCard(note, noteItem)
    };
    // Inject our string of HTML into our viewNotes.html page
    document.querySelector('#app').innerHTML = cards;
};

const createCard = (note, noteId) => {
    if(note.password){
   return  `
    <button class="button is-danger"  onclick="shownote('${noteId}', '${note.title}', '${note.text}', '${note.archive}')">Enter password</button>
   
   `
    } else if(note.archive !== true ){
    return `
     <div class="column is-one-quarter">
       <div class="card">
         <header class="card-header">
           <p class="card-header-title">${note.title}</p>
         </header>
         <div class="card-content">
           <div class="content">${note.text}</div>
         </div>
         <footer class="card-footer">
         <a id="${noteId}" href="#" class="card-footer-item"
         onclick="deleteNote('${noteId}')">Delete</a>
         
         <a  href="#" class="card-footer-item"
         onclick="editNote('${noteId}')">Edit</a>
         
            <a href="#" class="card-footer-item"
         onclick="archive('${noteId}', '${note.title}', '${note.text}')">Archive</a></footer>
       </div>
     </div>
   `
    } else {
        return ''
    };
};

function deleteNote(noteId) {
    const val = prompt("If you sure you want to delete this, type exactly 'Yes'");
    val === 'Yes' ? firebase.database().ref(`users/${googleUserId}/${noteId}`).remove() : alert("This not won't be deleted")
    console.log(noteId)
}

function editNote(noteId) {
    const editNoteModal = document.querySelector("#editNoteModal");
    const notesRef = firebase.database().ref(`users/${googleUserId}/${noteId}`);
    notesRef.on("value", (snapshot) => {
        const note = snapshot.val();
        document.querySelector("#editTitleInput").value = note.title;
        document.querySelector("#editTextInput").value = note.text
        document.querySelector("#noteId").value = noteId

    })
    editNoteModal.classList.toggle("is-active")
}

function saveEditedNote() {
    const title = document.querySelector("#editTitleInput").value;
    const text = document.querySelector("#editTextInput").value;
    const noteId = document.querySelector("#noteId").value
    const editedNote = {
        title,
        text
    }

    firebase.database().ref(`users/${googleUserId}/${noteId}`).update(editedNote)
    editNoteModal.classList.toggle("is-active")


}

function closeEditModal() {
    const editNoteModal = document.querySelector("#editNoteModal");
    editNoteModal.classList.toggle("is-active")

}

function archive(noteId, title, text) {
    firebase.database().ref(`users/${googleUserId}/${noteId}`).update({
        title: title,
        text: text,
        archive: true,
        password: ''
    })
};


function shownote(noteId, title, text, archive){
    const inp = String(prompt("What is the password"));
   console.log()
    const notesRef = firebase.database().ref(`users/${googleUserId}/${noteId}`);
    notesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log(data.password, String(inp))
        if(data.password === String(inp)){
  firebase.database().ref(`users/${googleUserId}/${noteId}`).update({
        title: title,
        text: text,
        archive: false,
        password: ''
    })
        }
    });

}

// firebase.database().ref( `users/${googleUserId}/${noteId}`).remove()

