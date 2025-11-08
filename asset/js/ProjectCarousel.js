// ProjectCarousel.js: #Project 섹션의 ProjectWrap 마우스 드래그, 관성 및 스냅 캐러셀 효과 구현

document.addEventListener('DOMContentLoaded', () => {
    const projectWrap = document.querySelector('.ProjectWrap');
    // 실제 HTML에 있는 카드 요소 (원본 + 복제 카드 포함)
    const projectCards = projectWrap ? projectWrap.querySelectorAll('.ProjectWrap > div') : [];
    
    // 기본 상태 변수
    let isDragging = false; 
    let isMoved = false; // 드래그 움직임이 있었는지 (클릭 방지용)
    let startX = 0;      // 드래그 시작 시 마우스 X 위치 
    let startScrollLeft = 0; // 드래그 시작 시 스크롤 위치
    
    // 애니메이션 및 스냅 관련 변수
    let animationFrame;       // requestAnimationFrame ID
    let cardWidth = 0;        // 개별 카드의 너비 (마진 포함)
    let actualMaxScroll = 0;  // 실제 스크롤 가능한 최대 범위
    
    let targetScroll = 0;     // 최종 목표 스크롤 위치 (스냅 위치)
    let currentScroll = 0;    // 현재 보간 중인 스크롤 위치
    let velocity = 0;         // 마우스를 놓았을 때의 속도 (관성 계산용)
    let lastX = 0;            // 관성 계산을 위한 이전 X 위치
    let timestamp = 0;        // 관성 계산을 위한 이전 시간
    
    // 상수
    const SNAP_VELOCITY_THRESHOLD = 0.5; // 스냅 이동 결정 최소 속도 (px/ms)
    const DRAG_MULTIPLIER = 0.8;         // 드래그 민감도
    const FRICTION = 0.92;               // 관성/감속 계수 (0.92: 느리게 멈춤)
    const ELASTICITY = 0.1;              // 스크롤 위치 보간 속도 (스냅 및 복귀 속도)
    const OVERPULL_RATIO = 0.25;         // 오버스크롤 탄성 계수 (클수록 더 많이 드래그 가능)
    
    if (!projectWrap || projectCards.length === 0) return;

    // ===============================================
    // 1. 초기화: 카드 너비 및 최대 스크롤 위치 계산
    // ===============================================
    
    const calculateCardMetrics = () => {
        // 첫 번째 카드를 기준으로 너비 계산
        const firstCard = projectCards[0];
        if (!firstCard) return;

        const style = window.getComputedStyle(firstCard);
        
        // offsetWidth: border, padding, content를 포함한 요소의 총 너비
        const marginRight = parseFloat(style.marginRight || 0);
        cardWidth = firstCard.offsetWidth + marginRight;
        
        // 실제 스크롤 가능한 최대 범위 계산
        // scrollWidth: 요소의 전체 콘텐츠 너비
        // clientWidth: 요소의 뷰포트 너비
        actualMaxScroll = projectWrap.scrollWidth - projectWrap.clientWidth;
        
        // 초기 스크롤 위치 설정
        currentScroll = projectWrap.scrollLeft;
        targetScroll = currentScroll; 
    };

    // ===============================================
    // 2. 애니메이션 루프 (관성 및 스냅 보간)
    // ===============================================
    
    const startAnimateLoop = () => {
        cancelAnimationFrame(animationFrame);
        
        const animate = () => {
            if (isDragging) {
                // 드래그 중에는 애니메이션 루프에서 아무것도 하지 않음.
                // onDragMove에서 즉시 스크롤 위치를 업데이트하고 탄성을 적용하기 때문.
                animationFrame = requestAnimationFrame(animate);
                return;
            }
            
            // --- 관성 적용 (드래그 종료 후) ---
            if (Math.abs(velocity) > 0.1) {
                currentScroll += velocity;
                velocity *= FRICTION; // 마찰력으로 속도 감소
            }

            // --- 스냅/복귀 보간 적용 ---
            // 관성 속도가 충분히 줄어들거나(0.1 미만) 목표 스크롤과 거리가 있으면 보간 시작
            if (Math.abs(velocity) < 0.1 || Math.abs(targetScroll - currentScroll) > 1) {
                currentScroll += (targetScroll - currentScroll) * ELASTICITY;
            }

            // --- 루프 종료 조건 (최적화) ---
            if (Math.abs(targetScroll - currentScroll) < 0.5 && Math.abs(velocity) < 0.1) {
                currentScroll = targetScroll;
                projectWrap.scrollLeft = currentScroll;
                velocity = 0;
                return; // 루프 중단
            }

            // 스크롤 위치 적용
            projectWrap.scrollLeft = currentScroll;
            
            animationFrame = requestAnimationFrame(animate);
        };
        
        timestamp = Date.now();
        animationFrame = requestAnimationFrame(animate);
    };

    // ===============================================
    // 3. 드래그 로직
    // ===============================================
    
    const startDrag = (e) => {
        // 모바일 터치(innerWidth <= 768)는 기본 스크롤을 사용하고, PC 마우스 왼쪽 버튼(e.button !== 0)만 처리
        if (e.button !== 0 || window.innerWidth <= 768) return; 
        
        isDragging = true;
        isMoved = false; 
        projectWrap.classList.add('is-dragging'); 
        
        // 상태 초기화
        startX = e.pageX;
        startScrollLeft = projectWrap.scrollLeft; // 드래그 시작 시 실제 스크롤 위치
        currentScroll = startScrollLeft; // 현재 위치로 currentScroll 초기화
        lastX = e.pageX;
        timestamp = Date.now();
        velocity = 0; 
        
        // 애니메이션 루프가 돌지 않고 있었다면 다시 시작
        startAnimateLoop(); 
        
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('mouseleave', onDragEnd);
    };

    const onDragMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const now = Date.now();
        const timeDelta = now - timestamp;
        
        // 마우스 이동 거리 (드래그 민감도 적용)
        let walk = (e.pageX - startX) * DRAG_MULTIPLIER; 
        
        // 오버스크롤 (탄성 효과) 적용을 위한 보정
        const prospectiveScroll = startScrollLeft - walk;
        
        if (prospectiveScroll < 0) {
            // 왼쪽 경계 오버스크롤
            walk = startScrollLeft + (-prospectiveScroll * OVERPULL_RATIO);
            currentScroll = 0 - walk;
        } else if (prospectiveScroll > actualMaxScroll) {
            // 오른쪽 경계 오버스크롤
            const overpull = prospectiveScroll - actualMaxScroll;
            currentScroll = actualMaxScroll + (overpull * OVERPULL_RATIO);
        } else {
            // 정상 범위 스크롤
            currentScroll = prospectiveScroll; 
        }
        
        // 스크롤 위치 즉시 반영
        projectWrap.scrollLeft = currentScroll;
        
        // 이동이 있었는지 플래그 설정 (클릭 방지 로직용)
        if (Math.abs(walk) > 5) {
            isMoved = true;
        }

        // 속도(Velocity) 계산 (관성 적용을 위해 필요: pixel/millisecond)
        const deltaX = e.pageX - lastX;
        if (timeDelta > 0) {
            velocity = deltaX / timeDelta;
        }
        
        lastX = e.pageX;
        timestamp = now;
    };
    
    const onDragEnd = () => {
        if (!isDragging) return;
        
        isDragging = false;
        projectWrap.classList.remove('is-dragging'); 
        
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('mouseleave', onDragEnd);
        
        // 현재 스크롤 위치를 targetScroll의 기준으로 설정 (경계 밖이었을 경우 대비)
        currentScroll = projectWrap.scrollLeft;
        targetScroll = currentScroll; // 초기 타겟은 현재 위치

        // 1. 경계 밖으로 벗어났는지 확인 후 복귀 타겟 설정
        if (currentScroll < 0) {
            targetScroll = 0;
            // 경계 복귀 시 관성 적용 없이 바로 보간하도록 velocity를 0에 가깝게 설정
            velocity = 0.01; 
        } else if (currentScroll > actualMaxScroll) {
            targetScroll = actualMaxScroll;
            velocity = -0.01;
        } 
        
        // 2. 정상 범위 내에 있다면 스냅 타겟 계산 (카드 너비가 0이 아닐 때만)
        else if (cardWidth > 0) {
            // 관성 속도가 충분하면 속도 방향으로 한 칸 이동 결정
            if (Math.abs(velocity) > SNAP_VELOCITY_THRESHOLD) {
                // velocity > 0: 왼쪽으로 빠르게 스크롤 (카드 인덱스 감소)
                const direction = velocity > 0 ? -1 : 1; 
                // Math.floor를 사용하는 대신 Math.round를 사용해 현재 위치에서 인덱스 계산
                const currentIndex = Math.round(currentScroll / cardWidth);
                const nextIndex = currentIndex + direction;
                
                targetScroll = nextIndex * cardWidth;
            } else {
                // 속도가 부족하면 가장 가까운 카드에 스냅
                const nearestIndex = Math.round(currentScroll / cardWidth);
                targetScroll = nearestIndex * cardWidth;
            }

            // 최종 스냅 위치는 0과 실제 최대 스크롤 범위 내에 있도록 보정
            targetScroll = Math.min(Math.max(0, targetScroll), actualMaxScroll);
        }
        
        // targetScroll이 설정된 후, animate 루프가 관성/보간을 처리함
        // 만약 관성 속도가 매우 낮고 스냅 위치와 현재 위치가 가까우면 루프가 즉시 중지됨.
    };

    // ===============================================
    // 4. 이벤트 리스너 등록
    // ===============================================

    // 마우스 드래그 이벤트 등록
    projectWrap.addEventListener('mousedown', startDrag);
    
    // 클릭 방지 로직 
    projectCards.forEach(card => {
        // 캡쳐 단계에서 리스너 실행 (true)
        card.addEventListener('click', (e) => {
            // 드래그 움직임이 있었으면 클릭 이벤트를 막음
            if (isMoved) {
                e.preventDefault(); 
                e.stopPropagation();
                // 이벤트를 막았으면 다음 단순 클릭을 위해 플래그 초기화
                isMoved = false; 
            }
        }, true);
    });

    // 창 크기 변경 시 카드 메트릭스 재계산 및 스크롤 위치 보정
    window.addEventListener('resize', () => {
        const prevScrollLeft = projectWrap.scrollLeft;
        calculateCardMetrics();
        
        // 리사이즈 후 가장 가까운 스냅 위치로 targetScroll을 재설정하고 부드럽게 이동
        if (cardWidth > 0 && actualMaxScroll >= 0) {
            // 리사이즈 전에 보였던 카드 인덱스를 기준으로 targetScroll 재설정
            const nearestIndex = Math.round(prevScrollLeft / cardWidth);
            targetScroll = Math.min(Math.max(0, nearestIndex * cardWidth), actualMaxScroll);
            
            // 현재 스크롤 위치를 targetScroll로 즉시 설정하지 않고, animate 루프가 이동시키도록 함
            currentScroll = projectWrap.scrollLeft;
        }
        
        // 애니메이션 루프 재시작 (보간 시작)
        startAnimateLoop();
    });
    
    // 초기화 함수 실행
    calculateCardMetrics();
    // 초기화 후 애니메이션 루프 시작 (초기 상태 보간을 위해)
    startAnimateLoop();

    // 외부 제어 함수
    window.startProjectCarousel = startAnimateLoop;
    window.stopProjectCarousel = () => {
        if (isDragging) {
            onDragEnd();
        }
        cancelAnimationFrame(animationFrame);
        velocity = 0;
    };
});
