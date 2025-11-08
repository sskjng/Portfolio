// InfoTab.js — 3번 차트 정상 표시 + 4번탭 자동스크롤(일시정지 포함) 완성본 (자동 탭 전환 기능 제거됨)

const buttons = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');
const contentArea = document.querySelector('.tab-content-area');
let currentTabIndex = 1;

// 공통 제어 변수
let wheelTarget = null;
let wheelHandler = null;
let scrollEndTimeout = null;
let autoScrollInterval = null;
let autoScrollStartTimeout = null;
let autoScrollPauseTimeout = null;

// -------------------------------
// 가로 스크롤 (휠 → 좌우 이동)
// -------------------------------
function handleHorizontalScrollOnTarget(e) {
  e.preventDefault();
  const el = e.currentTarget;
  el.scrollLeft += e.deltaY;
}

// -------------------------------
// 4번 탭 자동 스크롤 시작
// -------------------------------
function startAutoScroll(slider) {
  stopAutoScroll();

  const scrollSpeed = 1.2; // 자연스러운 속도
  autoScrollInterval = setInterval(() => {
    slider.scrollLeft += scrollSpeed;

    // 끝 도달 시 (탭 전환 없이 스크롤만 정지)
    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5) {
      stopAutoScroll();
      // Tab 1로의 자동 전환 로직 제거
    }
  }, 16); // 60fps
}

// -------------------------------
// 자동 스크롤 정지
// -------------------------------
function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
  if (autoScrollPauseTimeout) {
    clearTimeout(autoScrollPauseTimeout);
    autoScrollPauseTimeout = null;
  }
  if (autoScrollStartTimeout) {
    clearTimeout(autoScrollStartTimeout);
    autoScrollStartTimeout = null;
  }
  if (scrollEndTimeout) {
    clearTimeout(scrollEndTimeout);
    scrollEndTimeout = null;
  }
}

// -------------------------------
// 탭 활성화
// -------------------------------
function activateTab(index) {
  if (index < 1 || index > buttons.length) return;

  // 모든 탭 초기화
  buttons.forEach(btn => {
    btn.classList.remove('active');
    btn.classList.add('inactive');
  });
  contents.forEach(content => content.classList.remove('active'));

  // 현재 탭 활성화
  const activeButton = document.querySelector(`.tab-button[data-tab-index="${index}"]`);
  const activeContent = document.getElementById(`tab-${index}-content`);
  if (activeButton) {
    activeButton.classList.add('active');
    activeButton.classList.remove('inactive');
  }
  if (activeContent) {
    activeContent.classList.add('active');
  }

  // 초기화: 다른 탭으로 이동할 경우 기존 탭의 자동 스크롤/타이머 정리
  stopAutoScroll(); 

  if (wheelTarget && wheelHandler) {
    wheelTarget.removeEventListener('wheel', wheelHandler);
    wheelTarget = null;
    wheelHandler = null;
  }

  // -------------------------------
  // 3번 탭 (스킬차트)
  // -------------------------------
  if (index === 3) {
    if (typeof createSkillCharts === 'function') createSkillCharts();

    const skillItems = document.querySelectorAll('#tab-3-content .skill-item');
    skillItems.forEach((item, i) => {
      item.classList.remove('visible');
      setTimeout(() => item.classList.add('visible'), 100 * i + 300);
    });

    setTimeout(() => {
      if (typeof updateSkillCharts === 'function') updateSkillCharts();
    }, 1500);

    // 자동 탭 전환 로직 제거

  // -------------------------------
  // 4번 탭 (자동 스크롤 + 일시정지)
  // -------------------------------
  } else if (index === 4) {

    contentArea.classList.add('snap-enabled');
    const slider = activeContent.querySelector('.slider-container');
    if (slider) {
      slider.style.overflowX = 'auto';
      slider.style.overflowY = 'hidden';
      slider.scrollLeft = 0;

      // 휠 스크롤
      wheelHandler = handleHorizontalScrollOnTarget;
      wheelTarget = slider;
      wheelTarget.addEventListener('wheel', wheelHandler, { passive: false });

      // 1.5초 대기 후 자동 스크롤 시작
      autoScrollStartTimeout = setTimeout(() => {
        startAutoScroll(slider);
      }, 1500);

      // 🖱 마우스 인터랙션 제어
      let isPaused = false;

      function pauseScrollTemporarily() {
        // 자동 스크롤이 실행 중일 때만 작동
        if (autoScrollInterval) {
          stopAutoScroll();
          isPaused = true;
          clearTimeout(autoScrollPauseTimeout);
          autoScrollPauseTimeout = setTimeout(() => {
            isPaused = false;
            startAutoScroll(slider); // 1.5초 후 재개
          }, 1500); 
        } else if (isPaused) {
          // 이미 일시정지 상태에서 마우스가 또 움직이면 타이머 리셋 (재개 지연)
          clearTimeout(autoScrollPauseTimeout);
          autoScrollPauseTimeout = setTimeout(() => {
            isPaused = false;
            startAutoScroll(slider);
          }, 1500);
        }
      }

      slider.addEventListener('mouseenter', pauseScrollTemporarily);
      slider.addEventListener('mousemove', pauseScrollTemporarily);
      slider.addEventListener('mouseleave', () => {
        clearTimeout(autoScrollPauseTimeout);
        autoScrollPauseTimeout = setTimeout(() => {
          isPaused = false;
          // 스크롤이 끝났는지 확인 후 재개
          if (slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 5) {
             startAutoScroll(slider);
          }
        }, 2000);
      });
    }

  // -------------------------------
  // 1~2번 탭
  // -------------------------------
  } else {
    contentArea.classList.remove('snap-enabled');
    contentArea.scrollTop = 0;
    // 자동 탭 전환 로직 제거
  }

  currentTabIndex = index;
}

// -------------------------------
// 초기 실행
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  activateTab(currentTabIndex);

  buttons.forEach(button => {
    button.addEventListener('click', e => {
      const index = parseInt(e.currentTarget.getAttribute('data-tab-index'), 10);
      activateTab(index);
    });
  });

  // 자동 탭 전환 시작 로직 제거
});
