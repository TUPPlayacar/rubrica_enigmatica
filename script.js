document.addEventListener('DOMContentLoaded', () => {
    
    // Selectores del DOM Principal
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');
    const scoreSelectors = document.querySelectorAll('.score-selector');
    const detailBoxes = document.querySelectorAll('.detail-box');
    const finalGradeEl = document.getElementById('finalGrade');
    const performanceLevelEl = document.getElementById('performanceLevel');
    const form = document.getElementById('evaluationForm');
    const btnSave = document.getElementById('btnSave');
    const btnClear = document.getElementById('btnClear');
    const toast = document.getElementById('toast');
    const dateInput = document.getElementById('evaluationDate');

    // Selectores del Componente Modal de Retroalimentación
    const feedbackModal = document.getElementById('feedbackModal');
    const modalCloseX = document.getElementById('modalCloseX');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalStudentMeta = document.getElementById('modalStudentMeta');
    const modalScoreValue = document.getElementById('modalScoreValue');
    const modalLevelValue = document.getElementById('modalLevelValue');
    const modalFeedbackText = document.getElementById('modalFeedbackText');

    // Identificadores de formulario a persistir en LocalStorage
    const formFields = ['studentName', 'evaluationDate', 'gradeGroup'];

    // ESTABLECER LA FECHA ACTUAL POR DEFAULT EN EL INPUT DATE
    function setDefaultDate() {
        if (!dateInput.value) {
            const today = new Date();
            const year = today.getFullYear();
            let month = today.getMonth() + 1;
            let day = today.getDate();

            if (month < 10) month = '0' + month;
            if (day < 10) day = '0' + day;

            dateInput.value = `${year}-${month}-${day}`;
        }
    }

    // MANEJO DE ACORDEONES INTERACTIVOS
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(event) {
            if (event.target.tagName === 'SELECT' || event.target.tagName === 'OPTION') {
                return;
            }

            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });

    // Sincronizar las clases visuales resaltadas (.selected-item) según el combo
    function updateBoxSelectionVisuals() {
        const rubricItems = document.querySelectorAll('#rubricAccordionGroup .accordion-item');
        rubricItems.forEach(item => {
            const selector = item.querySelector('.score-selector');
            const currentValue = selector.value;
            const boxes = item.querySelectorAll('.detail-box');
            
            boxes.forEach(box => {
                if (box.getAttribute('data-value') === currentValue) {
                    box.classList.add('selected-item');
                } else {
                    box.classList.remove('selected-item');
                }
            });
        });
    }

    // INTERACCIÓN CLIC EN TARJETA DE CRITERIO
    detailBoxes.forEach(box => {
        box.addEventListener('click', function() {
            const accordionItem = this.closest('.accordion-item');
            const selector = accordionItem.querySelector('.score-selector');
            const newValue = this.getAttribute('data-value');

            selector.value = newValue;
            
            calculateGrade();
            saveToLocalStorage();
        });
    });

    // LÓGICA DE CÁLCULO EN TIEMPO REAL CON PONDERACIONES
    function calculateGrade() {
        let rawScoreSum = 0;
        let totalPossibleWeight = 0;
        const scoreData = {};

        const rubricItems = document.querySelectorAll('#rubricAccordionGroup .accordion-item');
        
        rubricItems.forEach(item => {
            const weight = parseFloat(item.getAttribute('data-weight'));
            const selector = item.querySelector('.score-selector');
            const score = parseInt(selector.value);
            
            rawScoreSum += (score / 4) * weight;
            totalPossibleWeight += weight;

            scoreData[selector.getAttribute('data-criterion')] = score;
        });

        const finalGrade = (rawScoreSum / totalPossibleWeight) * 100;
        const formattedGrade = finalGrade.toFixed(1);
        
        finalGradeEl.textContent = formattedGrade;

        let level = '';
        let colorClass = '';

        if (finalGrade >= 90) {
            level = 'Excelente';
            colorClass = '#27ae60';
        } else if (finalGrade >= 80) {
            level = 'Bueno';
            colorClass = '#f39c12';
        } else if (finalGrade >= 70) {
            level = 'Satisfactorio';
            colorClass = '#3498db';
        } else {
            level = 'Requiere mejorar';
            colorClass = '#e74c3c';
        }

        performanceLevelEl.textContent = level;
        performanceLevelEl.style.color = colorClass;

        updateBoxSelectionVisuals();

        return {
            grade: formattedGrade,
            performance: level,
            scores: scoreData
        };
    }

    // GENERADOR DINÁMICO DE RETROALIMENTACIÓN BASADO EN PARÁMETROS INSTITUCIONALES
    function generateFeedbackContent(grade, performance) {
        const studentName = document.getElementById('studentName').value || 'El estudiante';
        const gradeGroup = document.getElementById('gradeGroup').value || '-';
        
        // 1. Inyectar Meta-información en el Modal
        modalStudentMeta.innerHTML = `
            <strong>Evaluado:</strong> ${studentName} &nbsp;|&nbsp; 
            <strong>Grupo:</strong> ${gradeGroup} &nbsp;|&nbsp; 
            <strong>Estatus:</strong> Procesado Correctamente
        `;
        
        // 2. Definir Colores del Banner en base al nivel
        let badgeColor = '#27ae60';
        if (performance === 'Bueno') badgeColor = '#f39c12';
        if (performance === 'Satisfactorio') badgeColor = '#3498db';
        if (performance === 'Requiere mejorar') badgeColor = '#e74c3c';

        modalScoreValue.textContent = grade;
        modalLevelValue.textContent = performance;
        modalLevelValue.style.backgroundColor = badgeColor;
        modalLevelValue.style.color = 'white';
        modalLevelValue.style.padding = '0.3rem 0.8rem';
        modalLevelValue.style.borderRadius = '4px';

        // 3. Selección del Bloque de Texto de Diagnóstico Pedagógico
        let feedbackMessage = "";
        const numericGrade = parseFloat(grade);

        if (numericGrade >= 90) {
            feedbackMessage = `¡Felicidades extraordinarias! Has alcanzado un desempeño Sobresaliente. El proyecto demuestra un dominio avanzado y pulcro de la estructura semántica en HTML5, combinada con un diseño CSS3 responsivo sumamente estético y profesional. La lógica implementada en JavaScript funciona de manera óptima y fluida. Continúa manteniendo este nivel excepcional de atención al detalle, limpieza en el código y compromiso en tus entregas académicas.`;
        } else if (numericGrade >= 80) {
            feedbackMessage = `¡Muy buen trabajo! Tu desempeño se sitúa en un nivel Satisfactorio alto. La landing page cumple de forma sólida con los requisitos del diseño, la maquetación y la interactividad. El código está bien organizado, aunque existen pequeñas áreas de oportunidad operativas o sutiles fallos en la responsividad que pueden pulirse. Te invito a revisar los detalles mínimos reportados para elevar tu proyecto a un estándar de excelencia absoluta.`;
        } else if (numericGrade >= 70) {
            feedbackMessage = `El proyecto ha sido aprobado, logrando un nivel de desempeño Suficiente. Se evidencia la comprensión básica en el uso de HTML5, CSS3 y JavaScript para estructurar la landing page. No obstante, se detectan fallos evidentes en la experiencia de usuario (usabilidad), problemas de adaptación en dispositivos móviles o desorganización parcial en la lógica del código fuente. Es de vital importancia reforzar las bases técnicas de desarrollo y dedicar mayor tiempo a las pruebas de control de errores.`;
        } else {
            feedbackMessage = `En esta ocasión, la evaluación arroja un resultado Insuficiente (Aún no competente). Se identifica que el proyecto presenta ausencias críticas en el uso de etiquetas semánticas, carece de estilos CSS adecuados o la interactividad con JavaScript no fue implementada o contiene fallos estructurales graves que impiden su ejecución. Te exhorto a acercarte a las sesiones de asesoría y tutoría académica para reestructurar el diseño, limpiar la lógica de desarrollo y realizar una nueva entrega con éxito.`;
        }

        modalFeedbackText.textContent = feedbackMessage;
    }

    // INTERRUPTORES DE APERTURA Y CIERRE DEL MODAL
    function openModal() {
        const calculations = calculateGrade();
        generateFeedbackContent(calculations.grade, calculations.performance);
        feedbackModal.classList.add('show');
    }

    function closeModal() {
        feedbackModal.classList.remove('show');
    }

    // Listeners del Modal
    modalCloseX.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);
    
    // Cerrar si se hace clic fuera de la ventana blanca del modal
    feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            closeModal();
        }
    });

    // PERSISTENCIA DE DATOS EN LOCALSTORAGE
    function saveToLocalStorage() {
        const evaluationData = {
            teacher: document.getElementById('teacherName').value
        };
        
        formFields.forEach(field => {
            evaluationData[field] = document.getElementById(field).value;
        });

        const calculations = calculateGrade();
        evaluationData.calculation = calculations;

        localStorage.setItem('nexus_rubric_data', JSON.stringify(evaluationData));
    }

    function loadFromLocalStorage() {
        const storedData = localStorage.getItem('nexus_rubric_data');
        if (!storedData) {
            setDefaultDate();
            calculateGrade();
            return;
        }

        try {
            const data = JSON.parse(storedData);

            formFields.forEach(field => {
                if (data[field]) {
                    document.getElementById(field).value = data[field];
                }
            });

            setDefaultDate();

            if (data.calculation && data.calculation.scores) {
                Object.keys(data.calculation.scores).forEach(criterion => {
                    const selector = document.querySelector(`[data-criterion="${criterion}"]`);
                    if (selector) {
                        selector.value = data.calculation.scores[criterion];
                    }
                });
            }

            calculateGrade();

        } catch (error) {
            console.error("Error cargando los datos de evaluación: ", error);
            setDefaultDate();
            calculateGrade();
        }
    }

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // LISTENERS DE CONTROL DE CAMBIOS AUTOMÁTICOS
    scoreSelectors.forEach(selector => {
        selector.addEventListener('change', () => {
            calculateGrade();
            saveToLocalStorage();
        });
    });

    formFields.forEach(id => {
        document.getElementById(id).addEventListener('change', saveToLocalStorage);
    });

    // Acción de Guardar: Persiste los datos, muestra el Toast y salta el Modal automáticamente
    btnSave.addEventListener('click', (e) => {
        e.preventDefault();
        if (form.checkValidity()) {
            saveToLocalStorage();
            showToast();
            openModal(); // Despliega el modal de retroalimentación
        } else {
            form.reportValidity();
        }
    });

    btnClear.addEventListener('click', () => {
        if (confirm('¿Deseas restablecer y limpiar todos los datos del formulario y rúbrica actuales?')) {
            localStorage.removeItem('nexus_rubric_data');
            form.reset();
            scoreSelectors.forEach(selector => selector.value = "4");
            setDefaultDate();
            calculateGrade();
        }
    });

    // Inicializar el flujo completo de la APP
    loadFromLocalStorage();
});