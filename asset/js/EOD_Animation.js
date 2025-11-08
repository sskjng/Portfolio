document.addEventListener('DOMContentLoaded', () => {
    const eodSection = document.getElementById('EOD');
    const eodContent = document.querySelector('#EOD .eod-content');

    if (!eodSection || !eodContent) {
        return;
    }

    const animateEOD = () => {
        const viewportHeight = window.innerHeight;
        const sectionRect = eodSection.getBoundingClientRect();

        const scrollProgress = 1 - (sectionRect.top / viewportHeight);
        const clampedProgress = Math.min(1, Math.max(0, scrollProgress));

        const maxMove = 30;
        const yTranslate = maxMove * (0.1 - clampedProgress); 

        const opacityValue = Math.min(1, clampedProgress * 2); 

        eodContent.style.transform = `translateY(${yTranslate}vh)`;
        eodContent.style.opacity = opacityValue;
    };

    const handleScroll = () => {
        window.requestAnimationFrame(animateEOD);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    animateEOD();
});