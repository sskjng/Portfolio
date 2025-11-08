document.addEventListener('DOMContentLoaded', () => {
    const projectTitle = document.querySelector('#Project h2');

    if (!projectTitle) {
        return;
    }

    const MAX_MOVE_VW_X = 15;
    const OPACITY_START = 0;
    const STOP_RANGE = 0.2;
    
    const ENTRY_PROGRESS_MAX = 0.5;
    const EXIT_PROGRESS_MIN = -0.5;
    
    const ANIMATION_RANGE_LENGTH = ENTRY_PROGRESS_MAX - STOP_RANGE;

    const animateProjectTitle = () => {
        const titleRect = projectTitle.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const elementCenterY = titleRect.top + titleRect.height / 2;
        const viewportCenterY = viewportHeight / 2;
        
        const offsetFromCenter = elementCenterY - viewportCenterY;
        
        const CENTRAL_PROGRESS_RANGE = viewportHeight * 1.5; 
        let progress = offsetFromCenter / (CENTRAL_PROGRESS_RANGE / 2);
        
        progress = Math.min(ENTRY_PROGRESS_MAX, Math.max(EXIT_PROGRESS_MIN, progress));

        let moveMagnitude = 0;
        
        if (Math.abs(progress) > STOP_RANGE) {
            moveMagnitude = Math.abs(progress) - STOP_RANGE;
        }
        
        const normalizedFactor = Math.min(1.0, moveMagnitude / ANIMATION_RANGE_LENGTH); 

        let finalTranslateX = 0;
        
        if (progress > STOP_RANGE) {
            const lerpProgress = (progress - STOP_RANGE) / ANIMATION_RANGE_LENGTH;
            finalTranslateX = MAX_MOVE_VW_X * lerpProgress; 
            
        } else if (progress < -STOP_RANGE) {
            const progress_abs = Math.abs(progress);
            const lerpProgress = (progress_abs - STOP_RANGE) / ANIMATION_RANGE_LENGTH; 
            finalTranslateX = -MAX_MOVE_VW_X * lerpProgress;
        } 

        let finalOpacityTitle = 1;
        
        if (Math.abs(progress) > STOP_RANGE) {
            finalOpacityTitle = 1.0 - normalizedFactor;
            finalOpacityTitle = Math.min(1.0, Math.max(OPACITY_START, finalOpacityTitle));
        }

        projectTitle.style.transform = `translateX(${finalTranslateX}vw)`;
        projectTitle.style.opacity = finalOpacityTitle;

        requestAnimationFrame(animateProjectTitle);
    };
    
    window.addEventListener('scroll', animateProjectTitle);

    animateProjectTitle();
});
