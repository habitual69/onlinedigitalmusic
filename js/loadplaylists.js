document.addEventListener("DOMContentLoaded", async function () {
    const playlistsPerPage = 10; // Number of playlists per page
    const paginationContainer = document.getElementById("pagination-container");
    let playlistData = [];
    let currentPage = 1;
  
    async function fetchPlaylistData() {
      try {
        const response = await fetch("https://difm.vpms.xyz/home");
        const data = await response.json();
        return data.playlist_data;
      } catch (error) {
        console.error("Error fetching playlist data:", error);
        throw error;
      }
    }
  
    function createPlaylistCard(playlist) {
      const card = document.createElement("a");
      card.href = `track.html?playlistId=${playlist.id}`;
      card.className = "station-card bg-[#588157] p-0 rounded-xl shadow-xl relative overflow-hidden cursor-pointer transition-shadow hover:shadow-lg hover:scale-110 h-42 w-full";
      card.innerHTML = `
        <div class="station-image-container relative">
          <img src="${playlist.images}?size=440x440&quality=60" alt="${playlist.name}" class="rounded-t-lg object-cover w-full">
          <h2 class="bg-slate-900 opacity-90 absolute bottom-0 left-0 right-0 text-base font-semibold text-white text-center py-2" style="font-family: 'Quicksand', sans-serif;">${playlist.name}</h2>
        </div>
      `;
      return card;
    }
  
    function displayPlaylistsOnPage(playlistData, page) {
      const startIdx = (page - 1) * playlistsPerPage;
      const endIdx = startIdx + playlistsPerPage;
      const playlistsToShow = playlistData.slice(startIdx, endIdx);
  
      const playlistContainer = document.getElementById("playlist-container");
      playlistContainer.innerHTML = "";
  
      playlistsToShow.forEach(playlist => {
        const playlistCard = createPlaylistCard(playlist);
        playlistContainer.appendChild(playlistCard);
      });
    }
  
    function createPaginationButton(label, iconClass) {
      const button = document.createElement("button");
      button.className = "bg-[#84a98c] rounded-xl text-white px-4 py-2 hover:text-gray-900 focus:outline-none mb-5";
      button.innerHTML = `<i class="${iconClass}"></i> ${label}`;
  
      button.addEventListener("click", () => handlePaginationClick(label));
      return button;
    }
  
    function handlePaginationClick(label) {
      if (label === "Previous" && currentPage > 1) {
        currentPage--;
      } else if (label === "Next" && currentPage < Math.ceil(playlistData.length / playlistsPerPage)) {
        currentPage++;
      }
  
      displayPlaylistsOnPage(playlistData, currentPage);
    }

  
    async function displayPlaylistData() {
      try {
        playlistData = await fetchPlaylistData();
  
        displayPlaylistsOnPage(playlistData, currentPage);
  
        paginationContainer.innerHTML = "";
  
        const prevButton = createPaginationButton("Previous", "fas fa-chevron-left");
        prevButton.classList.add("mr-2");
        paginationContainer.appendChild(prevButton);
  
        const nextButton = createPaginationButton("Next", "fas fa-chevron-right");
        nextButton.classList.add("ml-2");
        paginationContainer.appendChild(nextButton);
  
        updatePaginationButtons();
      } catch (error) {
        console.error("Error displaying playlist data:", error);
      }
    }
  
    await displayPlaylistData();
  });
  