document.addEventListener('DOMContentLoaded', () => {
    const sloganSection = document.getElementById('Slogan01'); 
    const sloganLines = {
        line1: document.querySelector('#Slogan01 .slogan-line.line-1'),
        line2: document.querySelector('#Slogan01 .slogan-line.line-2'),
        line3: document.querySelector('#Slogan01 .slogan-line.line-3'),
    };

    if (!sloganSection || !sloganLines.line1) {
        return;
    }

    const START_OFFSET = {
        line1: -20,  // 왼쪽에서 시작
        line2: -40,  // 왼쪽에서 시작 (가장 크게 이동)
        line3: 100,  // 오른쪽에서 시작
    };

    const animateSlogan = () => {
        const sectionRect = sloganSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        const sectionCenterY = sectionRect.top + sectionRect.height / 2;
        const viewportCenterY = viewportHeight / 2;
        const offsetFromCenter = sectionCenterY - viewportCenterY; 
        const SCROLL_RANGE = viewportHeight * 10; 
        
        // 3. 정규화된 progress 계산 (중앙에서 0, 아래에서 -1, 위에서 1)
        // SCROLL_RANGE / 2 를 기준으로 progress를 -1 ~ 1로 정규화합니다.
        let progress = -offsetFromCenter / (SCROLL_RANGE / 2); 
        
        // 극단적인 움직임을 방지하기 위해 과도한 progress를 제한합니다. (5는 임의의 값)
        progress = Math.min(5, Math.max(-5, progress)); 

        for (const [key, line] of Object.entries(sloganLines)) {
            if (!line) continue;

            const startOffset = START_OFFSET[key]; 
            
            // Translation = -startOffset * progress
            const finalTranslateX = -startOffset * progress;
            
            const currentOpacity = 1; 

            if (key === 'line2') {
                // Scale 효과: 중앙(P=0)에서 Max(1.0), 멀어질수록 Min(0.7)
                const minScale = 0.7;
                const maxScale = 1.0;
                
                // 1 - Math.abs(progress)를 통해 중앙에서 1, 멀어질수록 0에 가까운 값을 얻습니다.
                const scaleFactor = Math.max(0, 1 - Math.abs(progress));
                const currentScale = minScale + ((maxScale - minScale) * scaleFactor);
                
                line.style.transform = `translateX(${finalTranslateX}vw) scale(${currentScale})`;
            } else {
                line.style.transform = `translateX(${finalTranslateX}vw)`;
            }
            line.style.opacity = currentOpacity;
        }
    };

    animateSlogan();
    // 스크롤 및 창 크기 변경 시 애니메이션 재실행
    window.addEventListener('scroll', animateSlogan);
    window.addEventListener('resize', animateSlogan);
});




document.addEventListener('DOMContentLoaded', () => {
    const sloganSection = document.getElementById('Slogan02'); 
    const sloganLines = {
        line1: document.querySelector('#Slogan02 .slogan-line.line-1'),
        line2: document.querySelector('#Slogan02 .slogan-line.line-2'),
        line3: document.querySelector('#Slogan02 .slogan-line.line-3'),
    };

    if (!sloganSection || !sloganLines.line1) {
        return;
    }

    const START_OFFSET = {
        line1: -20,  // 왼쪽에서 시작
        line2: -40,  // 왼쪽에서 시작 (가장 크게 이동)
        line3: 100,  // 오른쪽에서 시작
    };

    const animateSlogan = () => {
        const sectionRect = sloganSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        const sectionCenterY = sectionRect.top + sectionRect.height / 2;
        const viewportCenterY = viewportHeight / 2;
        const offsetFromCenter = sectionCenterY - viewportCenterY; 
        const SCROLL_RANGE = viewportHeight * 10; 
        
        // 3. 정규화된 progress 계산 (중앙에서 0, 아래에서 -1, 위에서 1)
        // SCROLL_RANGE / 2 를 기준으로 progress를 -1 ~ 1로 정규화합니다.
        let progress = -offsetFromCenter / (SCROLL_RANGE / 2); 
        
        // 극단적인 움직임을 방지하기 위해 과도한 progress를 제한합니다. (5는 임의의 값)
        progress = Math.min(5, Math.max(-5, progress)); 

        for (const [key, line] of Object.entries(sloganLines)) {
            if (!line) continue;

            const startOffset = START_OFFSET[key]; 
            
            // Translation = -startOffset * progress
            const finalTranslateX = -startOffset * progress;
            
            const currentOpacity = 1; 

            if (key === 'line2') {
                // Scale 효과: 중앙(P=0)에서 Max(1.0), 멀어질수록 Min(0.7)
                const minScale = 0.7;
                const maxScale = 1.0;
                
                // 1 - Math.abs(progress)를 통해 중앙에서 1, 멀어질수록 0에 가까운 값을 얻습니다.
                const scaleFactor = Math.max(0, 1 - Math.abs(progress));
                const currentScale = minScale + ((maxScale - minScale) * scaleFactor);
                
                line.style.transform = `translateX(${finalTranslateX}vw) scale(${currentScale})`;
            } else {
                line.style.transform = `translateX(${finalTranslateX}vw)`;
            }
            line.style.opacity = currentOpacity;
        }
    };

    animateSlogan();
    // 스크롤 및 창 크기 변경 시 애니메이션 재실행
    window.addEventListener('scroll', animateSlogan);
    window.addEventListener('resize', animateSlogan);
});
