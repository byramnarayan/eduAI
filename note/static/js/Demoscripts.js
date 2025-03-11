    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }
    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
          const videos = response.data.items;
          if (videos.length === 0) {
            document.getElementById("videoList").innerHTML = `
              <div class="text-center py-8 text-gray-600">
                <i class="fas fa-search-minus text-4xl mb-2"></i>
                <p>No videos found. Try a different search.</p>
              </div>
            `;
          } else {
            // Extract the topic name from the search query
            const topicName = query.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Update the title and subtitle
            document.getElementById("mainTitle").innerText = `Learning ${topicName} Programming`;
            document.getElementById("subTitle").innerText = `Follow along with tutorials and practice in the code compiler.`;

            // Display all video options
            displayVideoOptions(videos);
          }
        })
        .catch((error) => {
          console.error("Error fetching videos:", error);
          document.getElementById("videoList").innerHTML = `
            <div class="text-center py-8 text-red-600">
              <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
              <p>Error fetching videos. Please try again later.</p>
            </div>
          `;
        });
    }

    // Function to display all video options
    function displayVideoOptions(videos) {
      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = '<h3 class="font-medium text-gray-800 mb-4">Search Results</h3>'; 

      videos.forEach((video) => {
        const videoElement = document.createElement("div");
        videoElement.classList.add(
          "mb-4",
          "p-3",
          "rounded-lg",
          "border",
          "border-gray-200",
          "hover:bg-gray-50",
          "cursor-pointer"
        );
        videoElement.onclick = () => selectVideo(video);

        const videoThumb = document.createElement("img");
        videoThumb.src = video.snippet.thumbnails.medium.url;
        videoThumb.classList.add("w-full", "h-auto", "rounded-lg", "mb-2");
        videoThumb.alt = video.snippet.title;

        const videoTitle = document.createElement("p");
        videoTitle.innerText = video.snippet.title;
        videoTitle.classList.add("font-medium", "text-gray-800", "text-sm");

        const channelName = document.createElement("p");
        channelName.innerText = video.snippet.channelTitle;
        channelName.classList.add("text-xs", "text-gray-500", "mt-1");

        videoElement.appendChild(videoThumb);
        videoElement.appendChild(videoTitle);
        videoElement.appendChild(channelName);

        videoListSection.appendChild(videoElement);
      });
    }

    // Function to select a video
    function selectVideo(video) {
      selectedVideo = video;
      localStorage.setItem("selectedVideo", JSON.stringify(selectedVideo));

      const videoListSection = document.getElementById("videoList");
      videoListSection.innerHTML = ""; 

      const selectedVideoElement = document.createElement("div");
      selectedVideoElement.classList.add(
        "bg-white",
        "rounded-lg",
        "text-center"
      );

      // Video iframe
      const videoIframe = document.createElement("iframe");
      videoIframe.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`;
      videoIframe.frameBorder = "0";
      videoIframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      videoIframe.allowFullscreen = true;
      videoIframe.classList.add("w-full", "rounded-t-lg");
      videoIframe.style.height = "275px";

      const videoInfo = document.createElement("div");
      videoInfo.classList.add("p-3", "border-t", "border-gray-200");
      
      const videoTitle = document.createElement("h3");
      videoTitle.innerText = video.snippet.title;
      videoTitle.classList.add("font-medium", "text-gray-800", "text-left");
      
      const channelName = document.createElement("p");
      channelName.innerText = `By ${video.snippet.channelTitle}`;
      channelName.classList.add("text-sm", "text-gray-500", "mt-1", "text-left");
      
      const takeNoteBtn = document.createElement("button");
      takeNoteBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> Take Notes';
      takeNoteBtn.classList.add("mt-3", "bg-blue-500", "text-white", "px-4", "py-2", "rounded-lg", "text-sm");
      takeNoteBtn.onclick = () => {
        document.getElementById('notesTab').click();
        newNote(`Notes on ${video.snippet.title}`);
      };

      videoInfo.appendChild(videoTitle);
      videoInfo.appendChild(channelName);
      videoInfo.appendChild(takeNoteBtn);

      selectedVideoElement.appendChild(videoIframe);
      selectedVideoElement.appendChild(videoInfo);

      videoListSection.appendChild(selectedVideoElement);
    }

    // Function to load selected video from localStorage
    function loadSelectedVideo() {
      const storedVideo = localStorage.getItem("selectedVideo");
      if (storedVideo) {
        selectedVideo = JSON.parse(storedVideo);
        selectVideo(selectedVideo);
      }
    }

    // Function to switch tabs
    function switchTab(tab) {
      // Hide all content
      document.getElementById('notesContent').classList.add('hidden');
      document.getElementById('doubtsContent').classList.add('hidden');
      
      // Reset all tab styles
      document.getElementById('notesTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('notesTab').classList.add('bg-gray-200', 'text-gray-700');
      document.getElementById('doubtsTab').classList.remove('bg-blue-500', 'text-white');
      document.getElementById('doubtsTab').classList.add('bg-gray-200', 'text-gray-700');
      
      // Show selected content and style tab
      if (tab === 'notes') {
        document.getElementById('notesContent').classList.remove('hidden');
        document.getElementById('notesTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('notesTab').classList.add('bg-blue-500', 'text-white');
      } else if (tab === 'doubts') {
        document.getElementById('doubtsContent').classList.remove('hidden');
        document.getElementById('doubtsTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('doubtsTab').classList.add('bg-blue-500', 'text-white');
      }
    }

    // Function to load notes from localStorage
    function loadNotes() {
      const storedNotes = localStorage.getItem('notes');
      if (storedNotes) {
        notes = JSON.parse(storedNotes);
        updateNotesList();
      }
    }

    // Function to update notes list
    function updateNotesList() {
      const notesList = document.getElementById('notesList');
      const noteCount = document.getElementById('noteCount');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400 text-center py-4">No notes yet</li>';
        noteCount.textContent = '0';
        return;
      }
      
      notesList.innerHTML = '';
      notes.forEach((note, index) => {
        const noteItem = document.createElement('li');
        noteItem.classList.add(
          'p-2', 
          'rounded', 
          'cursor-pointer',
          'hover:bg-gray-200',
          'flex',
          'justify-between',
          'items-center'
        );
        
        if (currentNoteId === index) {
          noteItem.classList.add('bg-blue-100');
        }
        
        noteItem.innerHTML = `
          <span class="truncate" title="${note.title}">${note.title}</span>
          <button class="text-red-500 hover:text-red-700" onclick="deleteNote(${index}, event)">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        
        noteItem.addEventListener('click', function(e) {
          if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            loadNote(index);
          }
        });
        
        notesList.appendChild(noteItem);
      });
      
      noteCount.textContent = notes.length;
    }

    // Function to create a new note
    function newNote(title = '') {
      currentNoteId = null;
      document.getElementById('id_title').value = title;
      document.getElementById('id_content').value = '';
      document.getElementById('id_title').focus();
      
      // Switch to notes tab if not already active
      document.getElementById('notesTab').click();
      
      // Update UI to show which note is active
      updateNotesList();
    }

    // Function to load a note
    function loadNote(index) {
      if (index >= 0 && index < notes.length) {
        const note = notes[index];
        document.getElementById('id_title').value = note.title;
        document.getElementById('id_content').value = note.content;
        currentNoteId = index;
        
        // Update UI to show which note is active
        updateNotesList();
      }
    }

    // Function to save a note
    function saveNote() {
      const title = document.getElementById('id_title').value.trim();
      const content = document.getElementById('id_content').value.trim();
      
      if (!title || !content) {
        alert('Please enter both title and content for your note.');
        return;
      }
      
      const note = {
        title: title,
        content: content,
        timestamp: new Date().toISOString()
      };
      
      if (currentNoteId !== null) {
        // Update existing note
        notes[currentNoteId] = note;
      } else {
        // Add new note
        notes.push(note);
        currentNoteId = notes.length - 1;
      }
      
      // Save to localStorage and update UI
      localStorage.setItem('notes', JSON.stringify(notes));
      updateNotesList();
      
      // Optional: Submit to server
      document.getElementById('noteForm').submit();
    }

    // Function to delete a note
    function deleteNote(index, event) {
      event.stopPropagation();
      if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        if (currentNoteId === index) {
          newNote();
        } else if (currentNoteId > index) {
          currentNoteId--;
        }
        
        updateNotesList();
      }
    }

    // Function to format text in the note editor
    function formatText(format) {
      const textarea = document.getElementById('id_content');
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let formattedText = '';
      
      switch(format) {
        case 'bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'italic':
          formattedText = `_${selectedText}_`;
          break;
        case 'underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'h1':
          formattedText = `# ${selectedText}`;
          break;
        case 'list':
          formattedText = `\n- ${selectedText.split('\n').join('\n- ')}`;
          break;
        case 'code':
          formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
          break;
        default:
          formattedText = selectedText;
      }
      
      // Replace the selected text with the formatted text
      textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      
      // Set the cursor position after the inserted text
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      
      // Focus back on the textarea
      textarea.focus();
    }
    
    // Function for quick note taking
    function quickNote() {
      // Switch to notes tab and create a new note
      document.getElementById('notesTab').click();
      
      // If a video is selected, use its title
      if (selectedVideo) {
        newNote(`Quick Note: ${selectedVideo.snippet.title}`);
      } else {
        newNote('Quick Note');
      }
    }    const apiKey = "AIzaSyDZMYXZLT4su7mzzPG9B-vflruHJaJFF5A"; // Replace with a valid YouTube API key
    let selectedVideo = null; // Variable to store the selected video
    let notes = []; // Array to store notes
    let currentNoteId = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Set up notes buttons
      document.getElementById('saveNoteBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveNote();
      });
      
      document.getElementById('newNoteBtn').addEventListener('click', function() {
        newNote();
      });
      
      // Load stored notes and selected video
      loadNotes();
      loadSelectedVideo();
    });

    // Function to search videos
    function searchVideos() {
      const query = document.getElementById("interestInput").value;
      if (!query) {
        alert("Please enter a search query.");
        return;
      }
      
      // Show loading state
      document.getElementById("videoList").innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Searching for tutorials...</p>
        </div>
      `;
      
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}+programming+tutorial&key=${apiKey}&type=video&maxResults=10`;

      axios
        .get(url)
        .then((response) => {
     