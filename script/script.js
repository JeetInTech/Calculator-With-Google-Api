// Select dropdown containers and buttons
const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language"),
  swapBtn = document.querySelector(".swap-position"),
  inputTextElem = document.querySelector("#input-text"),
  outputTextElem = document.querySelector("#output-text"),
  copyBtn = document.querySelector("#copy-btn"),
  listenBtn = document.querySelector("#listen-btn"),
  voiceInputBtn = document.querySelector("#voice-input-btn"),
  downloadBtn = document.querySelector("#download-btn"),
  inputChars = document.querySelector("#input-chars"),
  darkModeCheckbox = document.getElementById("dark-mode-btn");

// Populate dropdowns with language options
function populateDropdown(dropdown, options) {
  dropdown.querySelector("ul").innerHTML = "";
  options.forEach((option) => {
    const li = document.createElement("li");
    const title = option.name + " (" + option.native + ")";
    li.innerHTML = title;
    li.dataset.value = option.code;
    li.classList.add("option");
    dropdown.querySelector("ul").appendChild(li);
  });
}

populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);

// Toggle dropdown visibility and selection
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");
  });

  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
      const selected = dropdown.querySelector(".selected");
      selected.innerHTML = item.innerHTML;
      selected.dataset.value = item.dataset.value;
      translate();
    });
  });
});

document.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});

// Swap languages and text
swapBtn.addEventListener("click", () => {
  const temp = inputLanguageDropdown.querySelector(".selected").innerHTML;
  const tempValue = inputLanguageDropdown.querySelector(".selected").dataset.value;
  inputLanguageDropdown.querySelector(".selected").innerHTML = outputLanguageDropdown.querySelector(".selected").innerHTML;
  inputLanguageDropdown.querySelector(".selected").dataset.value = outputLanguageDropdown.querySelector(".selected").dataset.value;
  outputLanguageDropdown.querySelector(".selected").innerHTML = temp;
  outputLanguageDropdown.querySelector(".selected").dataset.value = tempValue;

  // Swap text
  const tempText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempText;

  translate();
});

// Translation function using Google Translate API
function translate() {
  const inputText = inputTextElem.value;
  const inputLang = inputLanguageDropdown.querySelector(".selected").dataset.value;
  const outputLang = outputLanguageDropdown.querySelector(".selected").dataset.value;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLang}&tl=${outputLang}&dt=t&q=${encodeURI(inputText)}`;

  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      outputTextElem.value = json[0].map((item) => item[0]).join("");
    })
    .catch((error) => {
      console.log(error);
    });
}

inputTextElem.addEventListener("input", () => {
  if (inputTextElem.value.length > 5000) {
    inputTextElem.value = inputTextElem.value.slice(0, 5000);
  }
  inputChars.innerHTML = inputTextElem.value.length;
  translate();
});

// Upload document functionality
document.querySelector("#upload-document").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (
    file.type === "application/pdf" ||
    file.type === "text/plain" ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    document.querySelector("#upload-title").innerHTML = file.name;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      inputTextElem.value = e.target.result;
      translate();
    };
  } else {
    alert("Please upload a valid file.");
  }
});

// Download translation as a document
downloadBtn.addEventListener("click", () => {
  const outputText = outputTextElem.value;
  const outputLang = outputLanguageDropdown.querySelector(".selected").dataset.value;
  if (outputText) {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `translated-to-${outputLang}.txt`;
    a.href = url;
    a.click();
  }
});

// Dark mode toggle
darkModeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

// Copy translated text to clipboard
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(outputTextElem.value).then(() => {
    alert("Text copied to clipboard!");
  });
});

// Listen to translated text
listenBtn.addEventListener("click", () => {
  const utterance = new SpeechSynthesisUtterance(outputTextElem.value);
  utterance.lang = outputLanguageDropdown.querySelector(".selected").dataset.value;
  speechSynthesis.speak(utterance);
});

// Voice input functionality
voiceInputBtn.addEventListener("click", () => {
  fetch("http://localhost:5000/speak")
    .then(response => response.json())
    .then(data => {
      const transcription = data.transcription;
      if (transcription) {
        inputTextElem.value = transcription;
        translate();
      } else {
        alert("No speech detected or an error occurred.");
      }
    })
    .catch(error => {
      console.error("Error fetching transcription:", error);
      alert("Unable to reach the voice server. Make sure the Python server is running.");
    });
});
