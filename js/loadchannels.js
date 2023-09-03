document.addEventListener("DOMContentLoaded", async function () {
  const channelsPerPage = 10; // Number of channels per page
  const paginationContainer = document.getElementById("pagination-container");
  let channelData = [];
  let currentPage = 1;

  async function fetchChannelData() {
    try {
      const response = await fetch("https://difm.vpms.xyz/home");
      const data = await response.json();
      return data.channel_data;
    } catch (error) {
      console.error("Error fetching channel data:", error);
      throw error;
    }
  }

  function createChannelCard(channel) {
    const card = document.createElement("a");
    card.href = `track.html?channelId=${channel.channel_id}`;
    card.className = "station-card bg-[#588157] p-0 rounded-xl shadow-xl relative overflow-hidden cursor-pointer transition-shadow hover:shadow-lg hover:scale-110 h-42 w-full";
    card.innerHTML = `
      <div class="station-image-container relative">
        <img src="${channel.channel_image}?size=440x440&quality=60" alt="${channel.channel_name}" class="rounded-t-lg object-cover w-full">
        <h2 class="bg-slate-900 opacity-90 absolute bottom-0 left-0 right-0 text-base font-semibold text-white text-center py-2" style="font-family: 'Quicksand', sans-serif;">${channel.channel_name}</h2>
      </div>
    `;
    return card;
  }

  function displayChannelsOnPage(channelData, page) {
    const startIdx = (page - 1) * channelsPerPage;
    const endIdx = startIdx + channelsPerPage;
    const channelsToShow = channelData.slice(startIdx, endIdx);

    const channelContainer = document.getElementById("channel-container");
    channelContainer.innerHTML = "";

    channelsToShow.forEach(channel => {
      const channelCard = createChannelCard(channel);
      channelContainer.appendChild(channelCard);
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
    } else if (label === "Next" && currentPage < Math.ceil(channelData.length / channelsPerPage)) {
      currentPage++;
    }

    displayChannelsOnPage(channelData, currentPage);
  }

  async function displayChannelData() {
    try {
      channelData = await fetchChannelData();

      displayChannelsOnPage(channelData, currentPage);

      paginationContainer.innerHTML = "";

      const prevButton = createPaginationButton("Previous", "fas fa-chevron-left");
      prevButton.classList.add("mr-2");
      paginationContainer.appendChild(prevButton);

      const nextButton = createPaginationButton("Next", "fas fa-chevron-right");
      nextButton.classList.add("ml-2");
      paginationContainer.appendChild(nextButton);

      updatePaginationButtons();
    } catch (error) {
      console.error("Error displaying channel data:", error);
    }
  }

  await displayChannelData();
});
