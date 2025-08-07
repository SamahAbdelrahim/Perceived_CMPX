// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log("Starting pairwise comparison experiment initialization");
    let timeline = [];

    // Verify logExpData1 is available at startup
    if (typeof window.logExpData1 !== 'function') {
        console.error("logExpData1 function not available at startup!");
    } else {
        console.log("logExpData1 function verified at startup");
    }

    var jsPsych = initJsPsych({
        use_webaudio: false,
        on_finish: function (data) {
            console.log("Experiment finished, starting data logging");
            //jsPsych.data.displayData();

            var all_trials = jsPsych.data.get().values();
            console.log("Starting to log data");
            console.log(all_trials);

            // Check if logExpData1 is available
            if (typeof window.logExpData1 !== 'function') {
                console.error("logExpData1 function is not available at experiment end!");
                alert("There was an error saving your data. Please contact the study administrator.");
                return;
            }

            // Log each trial individually with error handling
            const logPromises = all_trials.map(trial => {
                return new Promise((resolve, reject) => {
                    try {
                        const result = window.logExpData1(trial);
                        if (result instanceof Promise) {
                            result.then(resolve).catch(reject);
                        } else {
                            resolve();
                        }
                    } catch (error) {
                        console.error("Error logging trial:", error);
                        reject(error);
                    }
                });
            });

            // Handle all logging promises
            Promise.all(logPromises)
                .then(() => {
                    console.log("All data logged successfully, redirecting...");
                    window.location.href = "https://app.prolific.com/submissions/complete?cc=C183XD81";
                })
                .catch(error => {
                    console.error("Failed to log all data:", error);
                    alert("There was an error saving your data. Please contact the study administrator.");
                });
        }
    });

    var globalStyles = `
        <style>
            /* General Page Styling */
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f9f9f9;
                color: #333;
                text-align: center;
                margin: 0;
                padding: 0;
            }
        
            /* Main Content Box */
            .jspsych-display-element {
                max-width: 95%;
                width: 95vw;
                min-width: 800px;
                max-height: 90vh;
                background: white;
                padding: 25px 40px;
                border-radius: 12px;
                box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
                margin: 1vh auto;
                overflow-y: auto;
                overflow-x: hidden;
                position: relative;
                top: 0px;
            }
        
            /* Improve Button Styles */
            .jspsych-btn {
                background-color: #8C1515;
                color: white;
                font-size: 18px;
                padding: 12px 24px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                transition: 0.3s ease-in-out;
            }
            .jspsych-btn:hover {
                background-color: #700F0F;
            }

            /* Video comparison layout */
            .video-comparison-container {
                display: flex;
                justify-content: space-around;
                align-items: center;
                margin: 20px 0;
                gap: 40px;
            }

            .video-item {
                flex: 1;
                max-width: 400px;
                text-align: center;
            }

            .video-item video {
                width: 100%;
                max-width: 350px;
                height: 250px;
                object-fit: cover;
                border-radius: 8px;
                box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            }

            .video-label {
                font-size: 18px;
                font-weight: bold;
                margin: 10px 0;
                color: #333;
            }

            .comparison-buttons {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 30px;
            }

            .comparison-btn {
                background-color: #8C1515;
                color: white;
                font-size: 16px;
                padding: 15px 30px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: 0.3s ease-in-out;
                min-width: 120px;
            }

            .comparison-btn:hover {
                background-color: #700F0F;
                transform: translateY(-2px);
            }

            .comparison-btn:disabled {
                background-color: #ccc;
                cursor: not-allowed;
                transform: none;
            }

            /* Responsive design */
            @media (max-width: 900px) {
                .video-comparison-container {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .video-item {
                    max-width: 100%;
                }
            }
        </style>
    `;
    
    // Inject global styles into the page
    document.head.insertAdjacentHTML('beforeend', globalStyles);

    // Available videos for the experiment
    let videos = [
        "1-1016-B0.mp4",
        "1-1016-B1.mp4", 
        "1-1016-B2.mp4",
        "1-1016-B3.mp4",
        "2-45-B0.mp4",
        "2-45-B1.mp4",
        "2-45-B2.mp4", 
        "2-45-B3.mp4",
        "3-1016-B0.mp4",
        "3-1016-B1.mp4",
        "3-1016-B2.mp4",
        "3-1016-B3.mp4"
    ];

    // Function to shuffle an array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to generate all possible pairwise combinations
    function generatePairwiseCombinations(videoList) {
        let combinations = [];
        for (let i = 0; i < videoList.length; i++) {
            for (let j = i + 1; j < videoList.length; j++) {
                combinations.push({
                    video1: videoList[i],
                    video2: videoList[j]
                });
            }
        }
        return shuffleArray(combinations);
    }

    // Generate pairwise combinations
    let pairwiseTrials = generatePairwiseCombinations(videos);
    console.log("Generated pairwise trials:", pairwiseTrials);

    // Welcome and consent
    var trial1 = {
        type: jsPsychInstructions,
        pages: [
            '<div style="text-align: center; margin-bottom: 10px;"><img src="../video_experiment/stanford.png"></div>' +
            '<div style="text-align: center; margin: 0 auto; max-width: 600px; font-size: 18px; line-height: 1.5; color: #333;">' +
            '<p>By answering the following questions, you are participating in a study being performed by cognitive scientists in the Stanford Department of Psychology.</p>' +
            '<p>If you have questions about this research, please contact us at <a href="mailto:languagecoglab@gmail.com" style="color: #007bff; text-decoration: none;">languagecoglab@gmail.com</a>.</p>' +
            '<p>You must be at least 18 years old to participate. Your participation in this research is voluntary.</p>' +
            '<p>You may decline to answer any or all of the following questions. You may decline further participation, at any time, without adverse consequences.</p>' +
            '<p>Your anonymity is assured.</p>' +
            '<p><strong>Click "Next" to begin.</strong></p>' +
            '</div>'
        ],
        show_clickable_nav: true,
        button_label: 'Next',
        button_html: '<button class="jspsych-btn" style="font-size: 20px; padding: 12px 24px; background-color: #8C1515; color: white; border: none; border-radius: 10px; cursor: pointer;">%choice%</button>'
    };

    timeline.push(trial1);

    // Experiment instructions
    var instructions = {
        type: jsPsychInstructions,
        pages: [
            '<div style="text-align: center; margin: 10px;"></div>' +
            '<div style="text-align: center; margin: 0 auto; max-width: 600px; font-size: 20px; line-height: 1.6; color: #333; padding: 20px;">' +
            '<p style="font-size: 14px; font-weight: bold; background-color: #FFF3CD; padding: 15px; border-radius: 8px; margin: 10px auto; max-width: 500px;">⚠️ You need to view in full screen </p>' +
            '<p>In this experiment, you will see pairs of videos showing objects rotating in 3D space.</p>' +
            '<p>For each pair, you will be asked to decide which object appears more <strong>complex</strong>.</p>' +
            '<p>Use your intuition to make these judgments - there are no right or wrong answers.</p>' +
            '</div>'
        ],
        on_finish: function (data) {
            // Capture info from Prolific
            var subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
            var study_id = jsPsych.data.getURLVariable('STUDY_ID');
            var session_id = jsPsych.data.getURLVariable('SESSION_ID');

            console.log("subject");
            console.log(subject_id);

            jsPsych.data.addProperties({
                subject_id: subject_id,
                study_id: study_id,
                session_id: session_id,
            });

            console.log("from object data");
            console.log(data.subject_id, data.study_id, data.session_id);
        },
        show_clickable_nav: true,
        button_label: "Next",
        button_html: '<button class="jspsych-btn" style="font-size: 20px; padding: 12px 24px; background-color: #8C1515; color: white; border: none; border-radius: 10px; cursor: pointer;">%choice%</button>'
    };

    timeline.push(instructions);


    // Main experiment trials - Video comparison with integrated open-ended question
    var main_trials = {
        timeline: [
            {
                type: jsPsychHtmlButtonResponse,
                stimulus: function() {
                    var video1 = jsPsych.timelineVariable('video1');
                    var video2 = jsPsych.timelineVariable('video2');
                    
                    return `
                        <div style="text-align: center; padding: 20px; max-width: 1000px; margin: 0 auto;">
                            <h2 style="font-size: 28px; margin-bottom: 40px; color: #333;">
                                Which object is more complex?
                            </h2>
                            
                            <div style="display: flex; justify-content: center; align-items: flex-start; gap: 60px; margin: 40px 0;">
                                <div style="text-align: center;">
                                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #8C1515;">Object A</div>
                                    <video id="video1" src="../video_experiment/videos/${video1}" 
                                           style="width: 350px; height: 250px; object-fit: cover; border-radius: 8px; border: 2px solid #8C1515;"
                                           muted>
                                    </video>
                                </div>
                                
                                <div style="text-align: center;">
                                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #8C1515;">Object B</div>
                                    <video id="video2" src="../video_experiment/videos/${video2}" 
                                           style="width: 350px; height: 250px; object-fit: cover; border-radius: 8px; border: 2px solid #8C1515;"
                                           muted>
                                    </video>
                                </div>
                            </div>
                            
                            <p id="instruction-text" style="margin-top: 30px; font-size: 18px; color: #666; max-width: 600px; margin-left: auto; margin-right: auto;">
                                Please wait for both videos to finish playing before making your choice.
                            </p>
                            
                            <div id="explanation-section" style="display: none; margin-top: 30px;">
                                <h3 style="font-size: 22px; margin-bottom: 20px; color: #333;">Please explain your choice:</h3>
                                <textarea id="explanation-text" 
                                          placeholder="Type your explanation here..." 
                                          style="width: 80%; max-width: 600px; height: 120px; padding: 15px; border: 2px solid #8C1515; border-radius: 8px; font-size: 16px; font-family: Arial, sans-serif; resize: vertical;"
                                          required></textarea>
                                <br><br>
                                <button id="submit-explanation" class="jspsych-btn" style="font-size: 18px; padding: 15px 30px; background-color: #8C1515; color: white; border: none; border-radius: 8px; cursor: pointer; min-width: 200px;">
                                    Continue
                                </button>
                            </div>
                        </div>
                    `;
                },
                choices: ['Object A is more complex', 'Object B is more complex'],
                button_html: '<button class="jspsych-btn" style="font-size: 18px; padding: 15px 30px; margin: 15px; background-color: #8C1515; color: white; border: none; border-radius: 8px; cursor: pointer; min-width: 200px;">%choice%</button>',
                on_load: function() {
                    var video1 = document.getElementById('video1');
                    var video2 = document.getElementById('video2');
                    var instructionText = document.getElementById('instruction-text');
                    var explanationSection = document.getElementById('explanation-section');
                    var submitButton = document.getElementById('submit-explanation');
                    
                    // Start both videos
                    video1.play();
                    video2.play();
                    
                    // Hide buttons initially
                    var buttons = document.querySelectorAll('.jspsych-btn');
                    buttons.forEach(btn => btn.style.display = 'none');
                    
                    // Show buttons after both videos finish
                    Promise.all([
                        new Promise(resolve => video1.addEventListener('ended', resolve)),
                        new Promise(resolve => video2.addEventListener('ended', resolve))
                    ]).then(() => {
                        buttons.forEach(btn => btn.style.display = 'inline-block');
                        //instructionText.textContent = 'Compare both objects and choose which one appears complex.';
                        instructionText.style.color = '#333';
                        instructionText.style.fontWeight = 'bold';
                    });
                    
                    // Handle choice button clicks
                    buttons.forEach(btn => {
                        btn.addEventListener('click', function() {
                            // Hide choice buttons
                            buttons.forEach(b => b.style.display = 'none');
                            
                            // Show explanation section
                            explanationSection.style.display = 'block';
                            
                            // Update instruction text
                            instructionText.textContent = 'Please explain why you made this choice. What made the object appear complex?';
                            instructionText.style.color = '#333';
                            instructionText.style.fontWeight = 'bold';
                        });
                    });
                    
                    // Handle submit explanation button
                    if (submitButton) {
                        submitButton.addEventListener('click', function() {
                            var explanationText = document.getElementById('explanation-text');
                            if (explanationText && explanationText.value.trim() !== '') {
                                // Continue to next trial
                                jsPsych.finishTrial();
                            } else {
                                alert('Please provide an explanation before continuing.');
                            }
                        });
                    }
                },
                on_finish: function(data) {
                    var video1 = jsPsych.timelineVariable('video1');
                    var video2 = jsPsych.timelineVariable('video2');
                    console.log("trial data:", data);

                    // Get the explanation text
                    var explanationText = document.getElementById('explanation-text');
                    var explanation = explanationText ? explanationText.value : '';

                    jsPsych.data.addDataToLastTrial({
                        video1: video1,
                        video2: video2,
                        chosen_video: data.response === 0 ? video1 : video2,
                        chosen_object: data.response === 0 ? 'Object A' : 'Object B',
                        explanation: explanation,
                        block: "main_experiment"
                    });
                }
            },
            {
                type: jsPsychHtmlButtonResponse,
                stimulus: function() {
                    var video1 = jsPsych.timelineVariable('video1');
                    var video2 = jsPsych.timelineVariable('video2');
                    var chosenObject = jsPsych.data.get().last(1).values()[0].chosen_object;
                    var chosenVideo = jsPsych.data.get().last(1).values()[0].chosen_video;
                    
                    // Determine which video was chosen for highlighting
                    var isVideo1Chosen = chosenObject === 'Object A';
                    var video1Border = isVideo1Chosen ? '4px solid #28a745' : '2px solid #8C1515';
                    var video2Border = !isVideo1Chosen ? '4px solid #28a745' : '2px solid #8C1515';
                    var video1Label = isVideo1Chosen ? 'Object A (Your Choice)' : 'Object A';
                    var video2Label = !isVideo1Chosen ? 'Object B (Your Choice)' : 'Object B';
                    
                    return `
                        <div style="text-align: center; padding: 20px; max-width: 1000px; margin: 0 auto;">
                            <h2 style="font-size: 28px; margin-bottom: 40px; color: #333;">
                                Explain Your Choice
                            </h2>
                            
                            <div style="display: flex; justify-content: center; align-items: flex-start; gap: 60px; margin: 40px 0;">
                                <div style="text-align: center;">
                                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: ${isVideo1Chosen ? '#28a745' : '#8C1515'};">${video1Label}</div>
                                    <video id="video1" src="../video_experiment/videos/${video1}" 
                                           style="width: 350px; height: 250px; object-fit: cover; border-radius: 8px; border: ${video1Border};"
                                           muted autoplay loop>
                                    </video>
                                </div>
                                
                                <div style="text-align: center;">
                                    <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: ${!isVideo1Chosen ? '#28a745' : '#8C1515'};">${video2Label}</div>
                                    <video id="video2" src="../video_experiment/videos/${video2}" 
                                           style="width: 350px; height: 250px; object-fit: cover; border-radius: 8px; border: ${video2Border};"
                                           muted autoplay loop>
                                    </video>
                                </div>
                            </div>
                            
                            <div style="margin-top: 40px; max-width: 800px; margin-left: auto; margin-right: auto;">
                                <h3 style="font-size: 22px; margin-bottom: 20px; color: #333;">
                                    Please explain why you chose ${chosenObject} as more complex:
                                </h3>
                                <textarea id="explanation-text" 
                                          placeholder="Type your explanation here..." 
                                          style="width: 100%; height: 150px; padding: 20px; border: 2px solid #8C1515; border-radius: 8px; font-size: 16px; font-family: Arial, sans-serif; resize: vertical; box-sizing: border-box;"
                                          required></textarea>
                            </div>
                        </div>
                    `;
                },
                choices: ['Continue'],
                button_html: '<button class="jspsych-btn" style="font-size: 18px; padding: 15px 30px; margin: 15px; background-color: #8C1515; color: white; border: none; border-radius: 8px; cursor: pointer; min-width: 200px;">%choice%</button>',
                on_load: function() {
                    // Start both videos
                    var video1 = document.getElementById('video1');
                    var video2 = document.getElementById('video2');
                    if (video1) video1.play();
                    if (video2) video2.play();
                    
                    // Add validation to the continue button
                    var continueButton = document.querySelector('.jspsych-btn');
                    if (continueButton) {
                        continueButton.addEventListener('click', function(e) {
                            var explanationText = document.getElementById('explanation-text');
                            if (!explanationText || explanationText.value.trim() === '') {
                                e.preventDefault();
                                e.stopPropagation();
                                alert('Please provide an explanation before continuing.');
                                return false;
                            }
                        });
                    }
                },
                on_finish: function(data) {
                    // Get the explanation text
                    var explanationText = document.getElementById('explanation-text');
                    var explanation = explanationText ? explanationText.value : '';
                    
                    // Add the explanation to the previous trial data
                    console.log("Explanation data:", explanation);
                    jsPsych.data.addDataToLastTrial({
                        explanation: explanation
                    });
                }
            }
        ],
        timeline_variables: pairwiseTrials, // Use all combinations for main experiment
        randomize_order: true
    };

    timeline.push(main_trials);

    // Thank you message
    var goodbye = {
        type: jsPsychInstructions,
        pages: [
            '<div style="text-align: center; margin: 50px;"><img src="../video_experiment/stanford.png"></div>' +
            '<div style="text-align: center; margin: 0 auto; max-width: 600px; font-size: 30px;">' +
            '<p> <b>Thank you for your participation and we appreciate you helping science. </b> </p>' +
            '<p> please click next to get redirected ...  </p>' +
            '</div>'
        ],
        show_clickable_nav: true,
    };

    timeline.push(goodbye);

    // Run the timeline
    jsPsych.run(timeline);
}); 