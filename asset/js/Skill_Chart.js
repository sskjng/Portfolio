// Skill_Chart.js 파일 내용

const skillData = [
    { id: 'photoshop', label: 'Photoshop', proficiency: 80, color: '#31C5F0', imagePath: 'asset/images/Photoshop.svg' },
    { id: 'illustrator', label: 'Illustrator', proficiency: 75, color: '#FF7F18', imagePath: 'asset/images/Illustrator.svg' },
    { id: 'figma', label: 'Figma', proficiency: 88, color: '#1ABCFE', imagePath: 'asset/images/Figma.svg' },
    { id: 'sketch', label: 'Sketch', proficiency: 80, color: '#EA6C00', imagePath: 'asset/images/Sketch.svg' },
    { id: 'xd', label: 'Xd', proficiency: 80, color: '#FF2BC2', imagePath: 'asset/images/Xd.svg' },
    { id: 'html', label: 'HTML', proficiency: 90, color: '#E44D26', imagePath: 'asset/images/Html.svg' },
    { id: 'css', label: 'CSS', proficiency: 85, color: '#264DE4', imagePath: 'asset/images/Css.svg' },
    { id: 'javascript', label: 'JavaScript', proficiency: 75, color: '#F7DF1E', imagePath: 'asset/images/Javascript.svg' },
    { id: 'git', label: 'Git/GitHub', proficiency: 80, color: '#E24329', imagePath: 'asset/images/git.svg' },
];

let charts = {}; // Chart 인스턴스를 저장하여 중복 생성 방지
const imageCache = {}; // 이미지 객체 캐시

// ====================================================================
// 💡 플러그인 1: 게이지 끝을 둥글게 처리 (Round Cap Plugin)
// ====================================================================
const roundCapPlugin = {
    id: 'roundCap',
    afterDraw: (chart) => {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        
        const element = meta.data[0];
        if (!element) return; 

        const { x, y, outerRadius, innerRadius, startAngle, endAngle } = element;
        const angleDelta = endAngle - startAngle;
        const radius = (outerRadius - innerRadius) / 2;
        
        if (angleDelta > 0) {
            ctx.save();
            ctx.fillStyle = element.options.backgroundColor; 

            // 1. 시작점 (startAngle)에 둥근 캡 그리기
            const startX = x + Math.cos(startAngle) * (innerRadius + radius);
            const startY = y + Math.sin(startAngle) * (innerRadius + radius);
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.fill();

            // 2. 끝점 (endAngle)에 둥근 캡 그리기
            const endX = x + Math.cos(endAngle) * (innerRadius + radius);
            const endY = y + Math.sin(endAngle) * (innerRadius + radius);
            ctx.beginPath();
            ctx.arc(endX, endY, radius, 0, 2 * Math.PI);
            ctx.fill();

            ctx.restore();
        }
    }
};

// ====================================================================
// 💡 플러그인 2: 도넛 차트 중앙에 이미지를 표시
// ====================================================================
const centerImagePlugin = {
    id: 'centerImage',
    afterDraw: (chart) => {
        const { ctx, width, height, data } = chart;
        const skillId = data.datasets[0].chartId; 
        const skillItem = skillData.find(s => s.id === skillId);

        if (!skillItem || !skillItem.imagePath) return;

        const imgPath = skillItem.imagePath;
        let img = imageCache[imgPath];

        if (!img) {
            img = new Image();
            img.onload = () => {
                chart.update(); 
            };
            img.src = imgPath;
            imageCache[imgPath] = img;
            return; 
        }

        if (img.complete) {
            ctx.save();
            
            const meta = chart.getDatasetMeta(0);
            if (!meta.data[0]) {
                ctx.restore();
                return;
            }
            
            const innerRadius = meta.data[0].innerRadius;
            const cutoutSize = innerRadius * 2; 
            const imageSize = cutoutSize * 0.7; 
            
            const centerX = width / 2;
            const centerY = height / 2;
            
            const x = centerX - imageSize / 2;
            const y = centerY - imageSize / 2;

            ctx.drawImage(img, x, y, imageSize, imageSize);
            
            ctx.restore();
        }
    }
};


/**
 * 💡 [수정] 차트를 0% 상태로 초기 생성하는 함수 (그려지는 애니메이션 준비)
 */
function createSkillCharts() {
    if (typeof Chart === 'undefined') {
        console.error("Chart.js 라이브러리가 로드되지 않았습니다.");
        return;
    }
    
    // 기존 차트 제거 (destroy()하지 않으면 메모리 누수 발생)
    skillData.forEach(skill => {
        if (charts[skill.id]) {
            charts[skill.id].destroy();
            delete charts[skill.id];
        }
    });

    skillData.forEach(skill => {
        const ctx = document.getElementById(`chart-${skill.id}`);
        if (!ctx) return; 

        charts[skill.id] = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [skill.label, 'Remaining'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [skill.color, '#e9ecef'],
                    borderWidth: 0,
                    circumference: 360,
                    chartId: skill.id
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '90%',
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            },
            plugins: [roundCapPlugin, centerImagePlugin] // ✅ 올바른 플러그인 등록 위치
        });

    });
}

/**
 * 💡 [유지] 차트의 데이터를 실제 숙련도로 업데이트하고 애니메이션을 실행하는 함수
 */
function updateSkillCharts() {
    skillData.forEach(skill => {
        if (charts[skill.id]) {
            // 실제 숙련도로 데이터 업데이트
            charts[skill.id].data.datasets[0].data = [skill.proficiency, 100 - skill.proficiency];
            
            // update() 호출 시, 변경된 데이터(0% -> 숙련도)에 대해
            // 위에서 설정한 animation 옵션에 따라 그려지는 애니메이션이 실행됩니다.
            charts[skill.id].update(); 
        }
    });
}