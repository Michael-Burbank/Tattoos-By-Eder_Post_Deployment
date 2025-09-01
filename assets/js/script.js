// Removes the #{Id} from the URL when Navigation Links are clicked.
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", function (event) {
    // Prevent the default anchor link behavior
    event.preventDefault();

    // Get the ID (e.g., "about")
    const targetId = this.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);

    // Smooth scroll to the target element
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Desktop Image Slider with Smooth Transitions
  (function () {
    const imageSlider = document.querySelector(".image-slider");
    if (!imageSlider) return;

    const slides = Array.from(imageSlider.querySelectorAll(".slide"));
    let index = 0;

    if (slides.length) {
      slides.forEach(
        (slide) => (slide.style.transition = "opacity 0.5s ease-in-out")
      );
      slides[0].classList.add("active");

      setInterval(() => {
        slides[index].classList.remove("active");
        slides[index].style.opacity = "0";
        index = (index + 1) % slides.length;
        slides[index].classList.add("active");
        slides[index].style.opacity = "1";
      }, 3000);
    }
  })();

  // Mobile Menu Toggle
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector(".main-navigation");
  const menuIcon = menuToggle?.querySelector("i");
  const body = document.body;
  const navLinks = document.querySelectorAll(".nav-links a");

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      if (nav.classList.contains("active")) {
        event.preventDefault();
        toggleMenu(() => {
          window.location.href = this.href;
        });
      }
    });
  });
  function toggleMenu(callback) {
    const isOpen = nav.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.classList.toggle("rotate");
    menuToggle.classList.toggle("active");

    // Toggle body overflow
    body.style.overflow = isOpen ? "hidden" : "";

    setTimeout(() => {
      menuIcon.classList.replace(
        isOpen ? "ri-menu-line" : "ri-close-line",
        isOpen ? "ri-close-line" : "ri-menu-line"
      );

      // Execute callback function after closing
      if (!isOpen && typeof callback === "function") {
        callback();
      }
    }, 150);
  }
});

// Swiper Initialization
if (typeof Swiper !== "undefined") {
  new Swiper(".swiper", {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    slidesPerGroup: 1,
    spaceBetween: 0,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    effect: "slide",
    breakpoints: {
      1440: { slidesPerView: 4 },
      1024: { slidesPerView: 3 },
      650: { slidesPerView: 2 },
      0: { slidesPerView: 1 },
    },
  });
}
// Gallery
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".category-button");
  const gallery = document.querySelector(".work-gallery");
  const workSection = document.querySelector(".work-section");

  // Create modal elements
  const modal = document.createElement("div");
  modal.classList.add("image-modal");
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn">×</span>
      <img class="modal-image" src="" alt="Enlarged Image">
    </div>
  `;
  document.body.appendChild(modal);

  const modalImage = modal.querySelector(".modal-image");
  const closeModal = modal.querySelector(".close-btn");

  const imageSets = {
    "black-grey": [
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267355/black-grey-1_tsbsfn.jpg",
        width: 3072,
        height: 4608,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267357/black-grey-2_bwzu9n.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267356/black-grey-3_iosflf.jpg",
        width: 1284,
        height: 804,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267358/black-grey-4_jcjlev.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267359/black-grey-5_bpooir.jpg",
        width: 3499,
        height: 2500,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267360/black-grey-6_jzgqfv.jpg",
        width: 3000,
        height: 3999,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267362/black-grey-7_oaj1ls.jpg",
        width: 3072,
        height: 4608,
      },
    ],
    portrait: [
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267379/portrait-1_auj25j.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267382/portrait-2_y9uyyh.jpg",
        width: 1284,
        height: 1472,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267382/portrait-3_zfxql6.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267383/portrait-4_qsaqyj.jpg",
        width: 4608,
        height: 3072,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267384/portrait-5_j84ikc.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267387/portrait-6_sb2hw2.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267389/portrait-7_wvnhfp.jpg",
        width: 1284,
        height: 1434,
      },
    ],
    lettering: [
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267373/lettering-1_jzylmg.jpg",
        width: 4032,
        height: 3024,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267375/lettering-2_w159i7.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267375/lettering-3_hhb7lv.jpg",
        width: 1284,
        height: 1285,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267376/lettering-4_zpjwzl.jpg",
        width: 1284,
        height: 1463,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267375/lettering-5_azflpe.jpg",
        width: 4032,
        height: 3024,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267377/lettering-6_fvwdhm.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267378/lettering-7_sjyu30.jpg",
        width: 1284,
        height: 1339,
      },
    ],
    payasas: [
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267389/traditional-1_ht85eh.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267391/traditional-2_ia8gh1.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267392/traditional-3_k2ouhf.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267394/traditional-4_csjoff.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267395/traditional-5_iy8bbm.jpg",
        width: 2854,
        height: 3110,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267396/traditional-6_tvrvcs.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267397/traditional-7_z9kaoi.jpg",
        width: 3024,
        height: 4032,
      },
    ],
    traditional: [
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1750270798/3_voedfc.jpg",
        width: 3072,
        height: 4608,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1750270791/5_crpuem.jpg",
        width: 2624,
        height: 2624,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1750270794/4_oqrwte.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1750270789/1_heut8w.jpg",
        width: 1084,
        height: 1129,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1750270791/2_xicmmx.jpg",
        width: 2584,
        height: 2789,
      },
    ],
    color: [
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267362/color-1_ucrwpo.jpg",
        width: 1284,
        height: 1432,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267365/color-2_q7jhl2.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267364/color-3_qb6zrh.jpg",
        width: 1284,
        height: 1592,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267366/color-4_amoytq.jpg",
        width: 1284,
        height: 1285,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267366/color-5_h737ej.jpg",
        width: 1284,
        height: 1577,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267367/color-6_vn2d0l.jpg",
        width: 3024,
        height: 4032,
      },
      {
        src: "https://res.cloudinary.com/dbbedy5lo/image/upload/v1741267369/color-7_sec9xf.jpg",
        width: 3020,
        height: 4027,
      },
    ],
  };

  function loadImages(category) {
    if (!gallery) return;
    gallery.style.opacity = "0"; // Fade out

    setTimeout(() => {
      gallery.innerHTML = ""; // Clear existing images

      // --- START OF FIX: Updated image creation loop ---
      imageSets[category].forEach((imageData) => {
        const newImg = document.createElement("img");

        // Create an optimized URL for a fast-loading thumbnail (400px wide)
        const optimizedSrc = imageData.src.replace(
          "/upload/",
          "/upload/w_400,q_85,f_auto/"
        );
        newImg.src = optimizedSrc;

        // Add original width and height to prevent layout shift
        newImg.width = imageData.width;
        newImg.height = imageData.height;

        newImg.setAttribute("loading", "lazy");
        newImg.classList.add("fade-in");
        gallery.appendChild(newImg);

        // For the modal popup, use the original, full-resolution image source
        newImg.addEventListener("click", () => openModal(imageData.src));
      });
      // --- END OF FIX ---

      setTimeout(() => {
        gallery.style.opacity = "1"; // Fade in
      }, 50);
    }, 100);
  }

  function loadAllCategories() {
    if (!workSection) return;
    workSection.innerHTML = ""; // Clear section

    const heading = document.createElement("h2");
    heading.textContent = "Eder's Work";
    workSection.appendChild(heading);

    Object.keys(imageSets).forEach((category) => {
      const section = document.createElement("div");
      section.classList.add("category-section");

      const title = document.createElement("h3");
      title.classList.add("category-title");
      title.textContent = category.replace("-", " ").toUpperCase();

      const galleryDiv = document.createElement("div");
      galleryDiv.classList.add("work-gallery");

      // --- START OF FIX: Updated image creation loop for mobile view ---
      imageSets[category].forEach((imageData) => {
        const newImg = document.createElement("img");

        const optimizedSrc = imageData.src.replace(
          "/upload/",
          "/upload/w_400,q_85,f_auto/"
        );
        newImg.src = optimizedSrc;

        newImg.width = imageData.width;
        newImg.height = imageData.height;

        newImg.setAttribute("loading", "lazy");
        newImg.classList.add("fade-in");
        galleryDiv.appendChild(newImg);

        // Add click event for modal
        newImg.addEventListener("click", () => openModal(imageData.src));
      });
      // --- END OF FIX ---

      section.appendChild(title);
      section.appendChild(galleryDiv);
      workSection.appendChild(section);
    });

    const bookButton = document.createElement("button");
    bookButton.classList.add("button", "book-btn");
    bookButton.textContent = "BOOK NOW";
    workSection.appendChild(bookButton);
  }

  function openModal(imageSrc) {
    modalImage.onload = function () {
      modal.classList.add("show");
    };
    modalImage.src = imageSrc;
  }

  closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });

  if (window.innerWidth <= 480) {
    loadAllCategories();
  } else {
    loadImages("black-grey"); // Default category
  }

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      if (window.innerWidth > 480) {
        const category = this.getAttribute("data-category");

        buttons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        loadImages(category);
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 480) {
      loadAllCategories();
    }
  });
});
// FAQ SECTION
document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq-item");

  function updateIcons() {
    const shouldShowIcons = window.innerWidth <= 900;

    faqItems.forEach((item) => {
      let toggleIcon = item.querySelector(".faq-toggle-icon");

      if (shouldShowIcons) {
        if (!toggleIcon) {
          toggleIcon = document.createElement("i");
          toggleIcon.classList.add("ri-add-line", "faq-toggle-icon");
          item.querySelector("h4").appendChild(toggleIcon);
        }
      } else {
        if (toggleIcon) {
          toggleIcon.remove();
        }
      }
    });
  }

  // Run on page load
  updateIcons();

  // Run when the window resizes
  window.addEventListener("resize", updateIcons);

  // Initialize FAQ items
  faqItems.forEach((item) => {
    const answer = item.querySelector("p");

    if (answer) {
      answer.style.overflow = "hidden";
      answer.style.transition = "max-height 0.4s ease-in-out";

      if (window.innerWidth <= 900) {
        answer.style.maxHeight = "0px";
        answer.style.display = "none";
      } else {
        answer.style.maxHeight = "none";
        answer.style.display = "block";
      }
    }

    item.addEventListener("click", function () {
      if (window.innerWidth > 900) return;

      this.classList.toggle("open");

      const answer = this.querySelector("p");
      const toggleIcon = this.querySelector(".faq-toggle-icon");

      if (this.classList.contains("open")) {
        answer.style.display = "block";
        requestAnimationFrame(() => {
          answer.style.maxHeight = answer.scrollHeight + "px";
        });
        toggleIcon.classList.replace("ri-add-line", "ri-subtract-line");
      } else {
        answer.style.maxHeight = "0px";
        toggleIcon.classList.replace("ri-subtract-line", "ri-add-line");

        setTimeout(() => {
          if (!this.classList.contains("open")) {
            answer.style.display = "none";
          }
        }, 400);
      }
    });
  });

  // Ensure correct state when resizing
  window.addEventListener("resize", () => {
    faqItems.forEach((item) => {
      const answer = item.querySelector("p");

      if (window.innerWidth > 900) {
        answer.style.maxHeight = "none";
        answer.style.display = "block";
      } else {
        answer.style.maxHeight = "0px";
        answer.style.display = "none";
      }
    });
  });
});

// Custom Video Play Button
const video = document.getElementById("tattoo-video");
const playButtonWrapper = document.getElementById("play-button");
const videoWrapper = document.querySelector(".video-wrapper");

video.controls = false;

videoWrapper.addEventListener("click", function (event) {
  if (video.controls && event.target === video) {
    return;
  }

  togglePlayPause();
});

playButtonWrapper.addEventListener("click", function (event) {
  event.stopPropagation();
  togglePlayPause();
});

function togglePlayPause() {
  if (video.paused) {
    video
      .play()
      .then(() => {
        playButtonWrapper.style.display = "none";
        video.controls = true;
      })
      .catch((err) => {
        console.error("Error playing video:", err);
      });
  } else {
    video.pause();
    playButtonWrapper.style.display = "flex";
    video.controls = false;
  }
}

video.addEventListener("play", function () {
  playButtonWrapper.style.display = "none";
  video.controls = true;
});

video.addEventListener("pause", function () {
  playButtonWrapper.style.display = "flex";
  video.controls = false;
});

videoWrapper.style.cursor = "pointer";
videoWrapper.style.position = "relative";
video.style.width = "100%";
video.style.height = "100%";

// Hero Section Animation
gsap.from(".hero-title h1", {
  opacity: 0,
  y: 50,
  duration: 1.2,
  ease: "power3.out",
});

gsap.from(".hero-description", {
  opacity: 0,
  y: 30,
  duration: 1.4,
  ease: "power3.out",
  delay: 0.3,
});

gsap.from(".swiper", {
  opacity: 0,
  scale: 0.9,
  duration: 1.5,
  ease: "power3.out",
  delay: 0.5,
});

// Navigation Menu Animation
const menu = document.querySelector(".main-navigation");
const toggle = document.querySelector("#menu-toggle");

// Gallery Image Stagger Animation
gsap.from(".image-gallery img", {
  opacity: 0,
  y: 50,
  stagger: 0.2,
  duration: 1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".image-gallery",
    start: "top 80%",
  },
});

// About Section Image and Text Animation
gsap.from(".artist-image img", {
  opacity: 0,
  x: -50,
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".artist-image",
    start: "top 85%",
  },
});

gsap.from(".artist-info", {
  opacity: 0,
  x: 50,
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".artist-info",
    start: "top 85%",
  },
});

// Tattoo Video Section Animation
gsap.from(".video-wrapper", {
  opacity: 0,
  y: 50,
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".tattoo-video-section",
    start: "top 85%",
  },
});

gsap.from(".gallery-button-container", {
  opacity: 0,
  scale: 0.9,
  duration: 1.2,
  ease: "power3.out",
  delay: 0.2,
  scrollTrigger: {
    trigger: ".gallery-button-container",
    start: "top 85%",
  },
});

// Smooth Fade-in for FAQ Section (only if FAQ items exist)
const _faqQuestions = document.querySelectorAll('.faq-question');
if (_faqQuestions.length) {
  gsap.from('.faq-question', {
    opacity: 0,
    y: 30,
    stagger: 0.2,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.faq-question',
      start: 'top 85%',
    },
  });
}

// Testimonials Animation
gsap.from(".testimonials", {
  opacity: 0,
  scale: 0.9,
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".testimonials",
    start: "top 85%",
  },
});

function isMobile() {
  return window.innerWidth <= 768; // Adjust breakpoint if needed
}

function openModal(imageSrc) {
  modalImage.src = imageSrc;
  modal.classList.add("show");

  if (isMobile()) {
    gsap.fromTo(
      modalImage,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const placement = document.querySelector('input[name="tattoo_placement"]');
  const placementCounter = document.getElementById('placement-counter');
  const description = document.querySelector('textarea[name="tattoo_description"]');
  const descriptionCounter = document.getElementById('description-counter');

  function bindCounter(el, counter) {
    if (!el || !counter) return;
    const max = parseInt(el.getAttribute('maxlength') || '0', 10);
    const update = () => {
      if (el.value.length > max) el.value = el.value.slice(0, max);
      counter.textContent = `${el.value.length}/${max}`;
    };
    ['input', 'change', 'paste'].forEach(evt => el.addEventListener(evt, update));
    update();
  }

  bindCounter(placement, placementCounter);
  bindCounter(description, descriptionCounter);
});

// Form Upload image
document.addEventListener("DOMContentLoaded", () => {
  const fileUploadAreas = document.querySelectorAll(".custom-file-upload");

  fileUploadAreas.forEach((label) => {
    const inputId = label.getAttribute("for");
    if (!inputId) return;

    const input = document.getElementById(inputId);
    const icon = label.querySelector(".upload-icon");
    const preview = label.querySelector(".image-preview");
    const removeBtn = label.querySelector(".remove-image");

    // Ensure all parts exist
    if (!input || !icon || !preview || !removeBtn) {
      console.warn(
        `Skipping setup for label targeting "${inputId}": Missing required elements (input, icon, preview, or removeBtn).`
      );
      return;
    }

    // Listener for file selection
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          label.classList.add("has-image");
        };
        reader.onerror = () => {
          console.error("Error reading file for input:", inputId);
          preview.src = "#";
          label.classList.remove("has-image");
          input.value = "";
        };
        reader.readAsDataURL(file);
      } else {
        // Handle case where selection is cancelled
        preview.src = "#";
        label.classList.remove("has-image");
        // Input value is already cleared by browser if cancelled
      }
    });

    // Listener for remove button click
    removeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      input.value = "";
      preview.src = "#";
      label.classList.remove("has-image");

      console.log("Image removed for input:", inputId);
    });
  });
});

/*
      // Modal logic
      const inquiryModal = document.getElementById('inquiry-modal');
      const inquiryModalClose = document.getElementById('inquiry-modal-close');
      const inquiryModalMessage = document.getElementById('inquiry-modal-message');
      const inquiryForm = document.getElementById('inquiry-form');

      function showInquiryModal(message, isSuccess) {
        inquiryModalMessage.innerHTML = message;
        inquiryModal.classList.add(isSuccess ? 'success' : 'error');
        inquiryModal.style.display = 'flex';
      }
      inquiryModalClose.onclick = function() {
        inquiryModal.style.display = 'none';
        inquiryModal.classList.remove('success', 'error');
      };
      window.onclick = function(event) {
        if (event.target === inquiryModal) {
          inquiryModal.style.display = 'none';
          inquiryModal.classList.remove('success', 'error');
        }
      };

      // AJAX form submission
      if (inquiryForm) {
        inquiryForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const formData = new FormData(inquiryForm);
          fetch(inquiryForm.action, {
            method: 'POST',
            body: formData
          })
          .then(response => response.text())
          .then(text => {
            let isSuccess = text.includes('Message has been sent');
            showInquiryModal(isSuccess ? 'Thank you! Your inquiry has been sent.' : text, isSuccess);
            if (isSuccess) inquiryForm.reset();
          })
          .catch(() => {
            showInquiryModal('An error occurred. Please try again later.', false);
          });
        });
      }
*/
// // Modal Script
// document.addEventListener("DOMContentLoaded", function () {
//   const inquiryForm = document.getElementById("inquiry-form");
//   const modal = document.getElementById("modal-popup");

//   if (!modal) {
//     return;
//   }

//   const modalContent = modal.querySelector(".modal-content");
//   const closeModalButton = modal.querySelector(".close");
//   const modalTitleElement = document.getElementById("modal-title");
//   const modalMessageElement = document.getElementById("modal-message");

//   const submitButton = inquiryForm
//     ? inquiryForm.querySelector('button[type="submit"]')
//     : null;
//   let originalButtonText = "SUBMIT";
//   if (submitButton) {
//     originalButtonText = submitButton.textContent;
//   }

//   // --- Image Preview Setup ---
//   const refImageInput = document.getElementById("ref_image_input");
//   const refImageLabel = document.querySelector('label[for="ref_image_input"]');
//   const placementImageInput = document.getElementById("placement_image_input");
//   const placementImageLabel = document.querySelector(
//     'label[for="placement_image_input"]'
//   );

//   function setupFileUpload(inputEl, labelEl) {
//     if (!inputEl || !labelEl) return;

//     const previewEl = labelEl.querySelector(".image-preview");
//     const removeBtnEl = labelEl.querySelector(".remove-image");

//     if (!previewEl || !removeBtnEl) return;

//     inputEl.addEventListener("change", function (event) {
//       const file = event.target.files[0];
//       if (file) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//           previewEl.src = e.target.result;
//           labelEl.classList.add("has-image");
//         };
//         reader.readAsDataURL(file);
//       }
//     });

//     removeBtnEl.addEventListener("click", (event) => {
//       event.preventDefault();
//       event.stopPropagation();
//       inputEl.value = "";
//       previewEl.src = "#";
//       labelEl.classList.remove("has-image");
//     });
//   }

//   setupFileUpload(refImageInput, refImageLabel);
//   setupFileUpload(placementImageInput, placementImageLabel);
//   // --- End of Image Preview Setup ---

//   function showModal(title, message, isError = false) {
//     if (!modal || !modalTitleElement || !modalMessageElement || !modalContent) {
//       const cleanMessage = message
//         .replace(/<br\s*\/?>/gi, "\n")
//         .replace(/<em>(.*?)<\/em>/gi, "$1");
//       alert(`${title}\n\n${cleanMessage}`);
//       return;
//     }
//     modalTitleElement.textContent = title;
//     modalMessageElement.innerHTML = message;
//     modalContent.classList.toggle("error-modal", isError);
//     modal.style.display = "flex";
//   }

//   function hideModal() {
//     if (!modal) return;
//     modal.style.display = "none";
//     if (modalContent) modalContent.classList.remove("error-modal");
//   }

//   if (inquiryForm) {
//     inquiryForm.addEventListener("submit", async function (event) {
//       event.preventDefault();
//       if (!submitButton) return;

//       submitButton.disabled = true;
//       submitButton.textContent = "SUBMITTING...";

//       const formData = new FormData(inquiryForm);

//       try {
//         const response = await fetch(inquiryForm.action, {
//           method: "POST",
//           body: formData,
//         });
//         const responseText = await response.text();
//         const trimmedResponseText = responseText.trim();

//         if (response.ok) {
//           if (trimmedResponseText === "Message has been sent") {
//             showModal(
//               "Thank You!",
//               "We've received your details and will get back to you shortly."
//             );

//             // Reset the form fields
//             inquiryForm.reset();

//             // Explicitly reset the image previews by removing the class
//             if (refImageLabel) refImageLabel.classList.remove("has-image");
//             if (placementImageLabel)
//               placementImageLabel.classList.remove("has-image");
//           } else {
//             showModal(
//               "Submission Failed",
//               `There was an issue:<br><br><em>${trimmedResponseText.replace(
//                 /\n/g,
//                 "<br>"
//               )}</em><br><br>Please check your input and try again.`,
//               true
//             );
//           }
//         } else {
//           showModal(
//             "Server Error",
//             `Our apologies, something went wrong on our end (Status: ${
//               response.status
//             }).<br><em>${trimmedResponseText.replace(
//               /\n/g,
//               "<br>"
//             )}</em><br><br>Please try again later.`,
//             true
//           );
//         }
//       } catch (error) {
//         showModal(
//           "Network Error",
//           "Could not connect. Please check your internet and try again.",
//           true
//         );
//       } finally {
//         submitButton.disabled = false;
//         submitButton.textContent = originalButtonText;
//       }
//     });
//   }

//   // Modal Closing Logic
//   if (closeModalButton) closeModalButton.addEventListener("click", hideModal);
//   window.addEventListener("click", (event) => {
//     if (modal && event.target === modal) hideModal();
//   });
//   window.addEventListener("keydown", (event) => {
//     if (modal && event.key === "Escape" && modal.style.display === "flex")
//       hideModal();
//   });

//   window.showModal = showModal;
// });

//-----END PREVIOUS MODAL CODE

// document.addEventListener("DOMContentLoaded", function () {
//   const inquiryForm = document.getElementById("inquiry-form");
//   const modal = document.getElementById("modal-popup");

//   if (!inquiryForm || !modal) {
//     console.error("Inquiry form or modal not found. Script terminated.");
//     return;
//   }

//   const modalContent = modal.querySelector(".modal-content");
//   // CORRECTED: Selects the element with class "close-btn"
//   const closeModalButton = modal.querySelector(".close-btn");
//   const modalTitleElement = document.getElementById("modal-title");
//   const modalMessageElement = document.getElementById("modal-message");
//   const submitButton = inquiryForm.querySelector('button[type="submit"]');
//   const originalButtonText = submitButton.textContent;

//   // --- Image Preview Setup ---
//   const refImageInput = document.getElementById("ref_image_input");
//   const refImageLabel = document.querySelector('label[for="ref_image_input"]');
//   const placementImageInput = document.getElementById("placement_image_input");
//   const placementImageLabel = document.querySelector(
//     'label[for="placement_image_input"]'
//   );

//   function setupFileUpload(inputEl, labelEl) {
//     if (!inputEl || !labelEl) return;

//     const previewEl = labelEl.querySelector(".image-preview");
//     const removeBtnEl = labelEl.querySelector(".remove-image");

//     if (!previewEl || !removeBtnEl) return;

//     inputEl.addEventListener("change", function (event) {
//       const file = event.target.files[0];
//       if (file) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//           previewEl.src = e.target.result;
//           labelEl.classList.add("has-image");
//         };
//         reader.readAsDataURL(file);
//       }
//     });

//     removeBtnEl.addEventListener("click", (event) => {
//       event.preventDefault();
//       event.stopPropagation();
//       inputEl.value = "";
//       previewEl.src = "#";
//       labelEl.classList.remove("has-image");
//     });
//   }

//   setupFileUpload(refImageInput, refImageLabel);
//   setupFileUpload(placementImageInput, placementImageLabel);

//   function showModal(title, message, isError = false) {
//     if (!modal || !modalTitleElement || !modalMessageElement || !modalContent) {
//       const cleanMessage = message
//         .replace(/<br\s*\/?>/gi, "\n")
//         .replace(/<em>(.*?)<\/em>/gi, "$1");
//       alert(`${title}\n\n${cleanMessage}`);
//       return;
//     }
//     modalTitleElement.textContent = title;
//     modalMessageElement.innerHTML = message;
//     modalContent.classList.toggle("error-modal", isError);
//     modal.style.display = "flex";
//   }

//   function hideModal() {
//     if (!modal) return;
//     modal.style.display = "none";
//     if (modalContent) modalContent.classList.remove("error-modal");
//   }

//   if (inquiryForm) {
//     inquiryForm.addEventListener("submit", async function (event) {
//       event.preventDefault();
//       if (!submitButton) return;

//       submitButton.disabled = true;
//       submitButton.textContent = "SUBMITTING...";

//       // Simulating a successful response for demonstration.
//       // Replace this simulation block with your actual fetch call to your PHP script.
//       await new Promise((resolve) => setTimeout(resolve, 1500));
//       const response = { ok: true };
//       const responseText = "Message has been sent";

//       try {
//         if (response.ok && responseText.trim() === "Message has been sent") {
//           showModal(
//             "Thank You!",
//             "We've received your details and will get back to you shortly."
//           );

//           inquiryForm.reset();

//           if (refImageLabel) refImageLabel.classList.remove("has-image");
//           if (placementImageLabel)
//             placementImageLabel.classList.remove("has-image");

//           const previews = inquiryForm.querySelectorAll(".image-preview");
//           previews.forEach((p) => (p.src = "#"));
//         } else {
//           showModal(
//             "Submission Failed",
//             `There was an issue:<em>${responseText}</em>`,
//             true
//           );
//         }
//       } catch (error) {
//         console.error("Form submission error:", error);
//         showModal(
//           "Network Error",
//           "Could not connect. Please check your internet and try again.",
//           true
//         );
//       } finally {
//         submitButton.disabled = false;
//         submitButton.textContent = originalButtonText;
//       }
//     });
//   }

//   // Modal closing listeners that will now work correctly
//   if (closeModalButton) {
//     closeModalButton.addEventListener("click", hideModal);
//   }
//   window.addEventListener("click", (event) => {
//     if (modal && event.target === modal) hideModal();
//   });
//   window.addEventListener("keydown", (event) => {
//     if (event.key === "Escape" && modal.style.display === "flex") hideModal();
//   });
// });

document.addEventListener("DOMContentLoaded", function () {
  const inquiryForm = document.getElementById("inquiry-form");
  const modal = document.getElementById("modal-popup");

  if (!inquiryForm || !modal) {
    console.error("Inquiry form or modal not found. Script terminated.");
    return;
  }

  const modalContent = modal.querySelector(".modal-content");
  // This robust selector will find your close button whether its class is "close" or "close-btn"
  const closeModalButton = modal.querySelector(".close, .close-btn");
  const modalTitleElement = document.getElementById("modal-title");
  const modalMessageElement = document.getElementById("modal-message");
  const submitButton = inquiryForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  const refImageInput = document.getElementById("ref_image_input");
  const refImageLabel = document.querySelector('label[for="ref_image_input"]');
  const placementImageInput = document.getElementById("placement_image_input");
  const placementImageLabel = document.querySelector(
    'label[for="placement_image_input"]'
  );

  function setupImageUpload(inputEl, labelEl) {
    if (!inputEl || !labelEl) return;
    const previewEl = labelEl.querySelector(".image-preview");
    const removeBtnEl = labelEl.querySelector(".remove-image");

    inputEl.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file && previewEl) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewEl.src = e.target.result;
          labelEl.classList.add("has-image");
        };
        reader.readAsDataURL(file);
      }
    });

    if (removeBtnEl) {
      removeBtnEl.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        inputEl.value = "";
        if (previewEl) previewEl.src = "#";
        labelEl.classList.remove("has-image");
      });
    }
  }

  setupImageUpload(refImageInput, refImageLabel);
  setupImageUpload(placementImageInput, placementImageLabel);

  function showModal(title, message, isError = false) {
    if (!modalTitleElement || !modalMessageElement || !modalContent) return;
    modalTitleElement.textContent = title;
    modalMessageElement.innerHTML = message;
    modalContent.classList.toggle("error-modal", isError);
    modal.style.display = "flex";
    document.body.classList.add('modal-open');
  }

  function hideModal() {
    if (!modal) return;
    modal.style.display = "none";
    if (modalContent) modalContent.classList.remove("error-modal");
    document.body.classList.remove('modal-open');
  }

  if (inquiryForm) {
    inquiryForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (!submitButton) return;
      submitButton.disabled = true;
      submitButton.textContent = "SUBMITTING...";

      // Show loading modal immediately
      showModal("Submitting...", "Please wait while we process your inquiry.");

      // Check reCAPTCHA
      const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
      if (!recaptchaResponse) {
        showModal(
          "reCAPTCHA Required",
          "Please complete the reCAPTCHA verification before submitting.",
          true
        );
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        return;
      }

      const formData = new FormData(inquiryForm);
      formData.append('g-recaptcha-response', recaptchaResponse);

      try {
        const response = await fetch(inquiryForm.action, {
          method: "POST",
          body: formData,
        });
        const responseText = await response.text();
        const trimmedResponseText = responseText.trim();
        if (response.ok && trimmedResponseText === "Message has been sent") {
          showModal(
            "Thank You!",
            "We've received your details and will get back to you shortly."
          );
          inquiryForm.reset();
          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
          }
          if (refImageLabel) refImageLabel.classList.remove("has-image");
          if (placementImageLabel) placementImageLabel.classList.remove("has-image");
          const previews = inquiryForm.querySelectorAll(".image-preview");
          previews.forEach((p) => (p.src = "#"));
        } else {
          showModal(
            "Submission Failed",
            `There was an issue: <em>${responseText || "Please check your details and try again."}</em>`,
            true
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        showModal(
          "Network Error",
          "Could not connect. Please check your internet and try again.",
          true
        );
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }

const phoneInput = inquiryForm.querySelector('input[name="phone_number"]');
if (phoneInput) {
  phoneInput.addEventListener('input', function () {
    let digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length <= 3) {
      phoneInput.value = digits;
    } else if (digits.length <= 6) {
      phoneInput.value = digits.replace(/(\d{3})(\d+)/, '$1-$2');
    } else if (digits.length <= 10) {
      phoneInput.value = digits.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
    } else {
      phoneInput.value = digits; // fallback for longer numbers
    }
  });
}


  // Modal closing listeners that will now work correctly
  if (closeModalButton) {
    closeModalButton.addEventListener("click", hideModal);
  }
  window.addEventListener("click", (event) => {
    if (event.target === modal) hideModal();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && modal.style.display === "flex") hideModal();
  });

  // Testimonials Section bg image (lazy loading applied)
  const testimonialsSection = document.getElementById("testimonials");
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        testimonialsSection.classList.add("lazy-loaded");
        observer.unobserve(testimonialsSection);
      }
    });
  });
  if (testimonialsSection) {
    observer.observe(testimonialsSection);
  }
});
