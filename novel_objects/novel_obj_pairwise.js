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
                    window.location.href = "https://app.prolific.com/submissions/complete?cc=C11U6ZL8";
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

    // Function to get all video files from the abstract animations folder structure
    function getAbstractAnimationVideos() {
        const videos = [];
        const basePath = '/general_assets/25-abstract-animations/';
        
        // Define the folder structure (folders 1-30)
        const folders = Array.from({length: 30}, (_, i) => i + 1);
        
        // For each folder, get the 4 beveling level videos
        // Based on the actual file structure, we need to handle different number patterns
        const folderPatterns = {
            1: '1016', 2: '45', 3: '1016', 4: '68', 5: '1016', 6: '45', 7: '1016', 8: '68',
            9: '1016', 10: '45', 11: '1016', 12: '68', 13: '1016', 14: '45', 15: '1016',
            16: '68', 17: '1016', 18: '45', 19: '1016', 20: '68', 21: '1016', 22: '45',
            23: '1016', 24: '68', 25: '1016', 26: '45', 27: '1016', 28: '68', 29: '1016', 30: '45'
        };
        
        folders.forEach(folderNum => {
            const bevelLevels = ['B0', 'B1', 'B2', 'B5'];
            const pattern = folderPatterns[folderNum] || '1016'; // fallback pattern
            
            bevelLevels.forEach(bevel => {
                const videoPath = `${basePath}${folderNum}/${folderNum}-${pattern}-${bevel}.mp4`;
                videos.push({
                    path: videoPath,
                    folder: folderNum,
                    bevel: bevel,
                    fullName: `${folderNum}-${pattern}-${bevel}.mp4`
                });
            });
        });
        
        return videos;
    }

    // Function to shuffle an array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to generate pairwise combinations with randomization
    function generatePairwiseCombinations(videoList) {
        let combinations = [];
        
        // First, randomly select one video from each folder to ensure diversity
        const folders = [...new Set(videoList.map(v => v.folder))];
        const selectedVideos = [];
        
        folders.forEach(folder => {
            const folderVideos = videoList.filter(v => v.folder === folder);
            const randomVideo = folderVideos[Math.floor(Math.random() * folderVideos.length)];
            selectedVideos.push(randomVideo);
        });
        
        // Shuffle the selected videos
        const shuffledVideos = shuffleArray(selectedVideos);
        
        // Generate all possible pairwise combinations
        for (let i = 0; i < shuffledVideos.length; i++) {
            for (let j = i + 1; j < shuffledVideos.length; j++) {
                // Randomly decide which video goes on left vs right
                if (Math.random() < 0.5) {
                    combinations.push({
                        video1: shuffledVideos[i],
                        video2: shuffledVideos[j],
                        left_video: shuffledVideos[i],
                        right_video: shuffledVideos[j]
                    });
                } else {
                    combinations.push({
                        video1: shuffledVideos[j],
                        video2: shuffledVideos[i],
                        left_video: shuffledVideos[j],
                        right_video: shuffledVideos[i]
                    });
                }
            }
        }
        
        return shuffleArray(combinations);
    }

    // Main function to initialize the experiment
    function initializeExperiment() {
        // Get all video files
        const allVideos = getAbstractAnimationVideos();
        console.log("All videos loaded:", allVideos);

        // Generate pairwise combinations
        let pairwiseTrials = generatePairwiseCombinations(allVideos);
        console.log("Generated pairwise trials:", pairwiseTrials);

        // Limit to a reasonable number of trials (e.g., 15)
        pairwiseTrials = pairwiseTrials.slice(0, 15);
        console.log("Final pairwise trials:", pairwiseTrials);

        // Welcome and consent
        var trial1 = {
            type: jsPsychInstructions,
            pages: [
                '<div style="text-align: center; margin-bottom: 10px;"><img src="/general_assets/stanford.png"></div>' +
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
                '<p>In this experiment, you will see pairs of videos showing abstract 3D objects rotating.</p>' +
                '<p>For each pair, you will be asked to decide which object appears more <strong>complex</strong>.</p>' +
                '<p>Use your intuition to make these judgments - there are no right or wrong answers.</p>' +
                '<p>Please click next to begin.</p>' +
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
            button_label: "Let's Begin",
            button_html: '<button class="jspsych-btn" style="font-size: 20px; padding: 12px 24px; background-color: #8C1515; color: white; border: none; border-radius: 10px; cursor: pointer;">%choice%</button>'
        };

        timeline.push(instructions);

        // Main experiment trials - Video comparison only (no open-ended question)
        var main_trials = {
            timeline: [
                {
                    type: jsPsychHtmlButtonResponse,
                    stimulus: function() {
                        var leftVideo = jsPsych.timelineVariable('left_video');
                        var rightVideo = jsPsych.timelineVariable('right_video');
                        
                        return `
                            <div style="text-align: center; padding: 20px; max-width: 1000px; margin: 0 auto;">
                                <h2 style="font-size: 28px; margin-bottom: 40px; color: #333;">
                                    Which object is more complex?
                                </h2>
                                
                                <div style="display: flex; justify-content: center; align-items: flex-start; gap: 60px; margin: 40px 0;">
                                    <div style="text-align: center;">
                                        <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #8C1515;">Object A</div>
                                        <video id="video1" src="${leftVideo.path}" 
                                               style="width: 350px; height: 250px; object-fit: cover; border-radius: 8px; border: 2px solid #8C1515;"
                                               muted loop>
                                        </video>
                                    </div>
                                    
                                    <div style="text-align: center;">
                                        <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #8C1515;">Object B</div>
                                        <video id="video2" src="${rightVideo.path}" 
                                               style="width: 350px; height: 250px; object-fit: cover; border-radius: 8px; border: 2px solid #8C1515;"
                                               muted loop>
                                        </video>
                                    </div>
                                </div>
                                
                                <p id="instruction-text" style="margin-top: 30px; font-size: 18px; color: #666; max-width: 600px; margin-left: auto; margin-right: auto;">
                                    Please wait for both videos to finish playing before making your choice.
                                </p>
                            </div>
                        `;
                    },
                    choices: ['Object A is more complex', 'Object B is more complex'],
                    button_html: '<button class="jspsych-btn" style="font-size: 18px; padding: 15px 30px; margin: 15px; background-color: #8C1515; color: white; border: none; border-radius: 8px; cursor: pointer; min-width: 200px;">%choice%</button>',
                    on_load: function() {
                        var video1 = document.getElementById('video1');
                        var video2 = document.getElementById('video2');
                        var instructionText = document.getElementById('instruction-text');
                        
                        // Hide buttons initially
                        var buttons = document.querySelectorAll('.jspsych-btn');
                        buttons.forEach(btn => btn.style.display = 'none');
                        
                        // Track if each video has completed its first play
                        let video1Completed = false;
                        let video2Completed = false;

                        console.log("Setting up video completion tracking");
                        
                        // Log video properties
                        console.log("Video1 properties:", {
                            duration: video1.duration,
                            readyState: video1.readyState,
                            paused: video1.paused,
                            src: video1.src
                        });
                        console.log("Video2 properties:", {
                            duration: video2.duration,
                            readyState: video2.readyState,
                            paused: video2.paused,
                            src: video2.src
                        });

                        // Add loadedmetadata event listeners
                        video1.addEventListener('loadedmetadata', function() {
                            console.log("Video1 metadata loaded - Duration:", video1.duration);
                        });

                        video2.addEventListener('loadedmetadata', function() {
                            console.log("Video2 metadata loaded - Duration:", video2.duration);
                        });

                        // Add play event listeners
                        video1.addEventListener('play', function() {
                            console.log("Video1 started playing");
                        });

                        video2.addEventListener('play', function() {
                            console.log("Video2 started playing");
                        });

                        // Start both videos with error handling
                        Promise.all([
                            video1.play().catch(error => console.error("Error playing video1:", error)),
                            video2.play().catch(error => console.error("Error playing video2:", error))
                        ]).then(() => {
                            console.log("Both videos started playing");
                        });

                        // Function to check if both videos have completed their first play
                        function checkBothVideosCompleted() {
                            console.log("Checking completion - Video1:", video1Completed, "Video2:", video2Completed);
                            if (video1Completed && video2Completed) {
                                console.log("Both videos completed, showing buttons");
                                buttons.forEach(btn => {
                                    btn.style.display = 'inline-block';
                                    console.log("Button display style set to:", btn.style.display);
                                });
                                instructionText.style.color = '#333';
                                instructionText.style.fontWeight = 'bold';
                                instructionText.textContent = 'Please make your choice.';
                            }
                        }

                        // Add timeupdate event listeners to check when videos reach their end
                        video1.addEventListener('timeupdate', function() {
                            if (!video1Completed && video1.currentTime >= video1.duration * 0.9) {  // Check at 90% of duration
                                console.log("Video1 reached end - Duration:", video1.duration, "Current time:", video1.currentTime);
                                video1Completed = true;
                                checkBothVideosCompleted();
                            }
                        });

                        video2.addEventListener('timeupdate', function() {
                            if (!video2Completed && video2.currentTime >= video2.duration * 0.9) {  // Check at 90% of duration
                                console.log("Video2 reached end - Duration:", video2.duration, "Current time:", video2.currentTime);
                                video2Completed = true;
                                checkBothVideosCompleted();
                            }
                        });

                        // Also check completion on the 'ended' event as a backup
                        video1.addEventListener('ended', function() {
                            if (!video1Completed) {
                                console.log("Video1 ended event fired");
                                video1Completed = true;
                                checkBothVideosCompleted();
                            }
                        });

                        video2.addEventListener('ended', function() {
                            if (!video2Completed) {
                                console.log("Video2 ended event fired");
                                video2Completed = true;
                                checkBothVideosCompleted();
                            }
                        });

                        // Add a fallback timer to check completion after a reasonable time
                        setTimeout(function() {
                            if (!video1Completed && video1.duration && video1.currentTime >= video1.duration * 0.8) {
                                console.log("Video1 fallback completion check");
                                video1Completed = true;
                                checkBothVideosCompleted();
                            }
                            if (!video2Completed && video2.duration && video2.currentTime >= video2.duration * 0.8) {
                                console.log("Video2 fallback completion check");
                                video2Completed = true;
                                checkBothVideosCompleted();
                            }
                        }, 1000); // Check after 1 second
                    },
                    on_finish: function(data) {
                        var leftVideo = jsPsych.timelineVariable('left_video');
                        var rightVideo = jsPsych.timelineVariable('right_video');

                        console.log("trial data:", data);

                        jsPsych.data.addDataToLastTrial({
                            leftVideo: leftVideo.path,
                            rightVideo: rightVideo.path,
                            leftVideoFolder: leftVideo.folder,
                            rightVideoFolder: rightVideo.folder,
                            leftVideoBevel: leftVideo.bevel,
                            rightVideoBevel: rightVideo.bevel,
                            chosen_video: data.response === 0 ? leftVideo.path : rightVideo.path,
                            chosen_position: data.response === 0 ? 'left' : 'right',
                            chosen_object: data.response === 0 ? 'Object A' : 'Object B',
                            chosen_folder: data.response === 0 ? leftVideo.folder : rightVideo.folder,
                            chosen_bevel: data.response === 0 ? leftVideo.bevel : rightVideo.bevel,
                            trial_type: "comparison_trial",
                            block: "main_experiment"
                        });
                    }
                }
            ],
            timeline_variables: pairwiseTrials,
            randomize_order: true
        };

        timeline.push(main_trials);

        // Thank you message
        var goodbye = {
            type: jsPsychInstructions,
            pages: [
                '<div style="text-align: center; margin: 50px;"><img src="/general_assets/stanford.png"></div>' +
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
    }

    // Start the experiment
    initializeExperiment();
});
