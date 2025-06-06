 let gameStarted = false;
        let selectedImageSetKey = '';
        let currentDifficulty = ''; // 'easy', 'medium', 'hard'
        let currentGridSize = 3; // 3, 4, or 5

        // Updated IMAGE_SETS structure to correctly reflect Doraemon's image names and extensions
        const IMAGE_SETS = {
            'doraemon': {
                full: 'doremon.jpg',
                difficulties: {
                    'easy': {
                        grid: 3,
                        // Doraemon Easy: 1.jpg, 2.jpg, ...
                        pieces: Array.from({length: 9}, (_, i) => `doremon/easy/${i + 1}.jpg`)
                    },
                    'medium': {
                        grid: 4,
                        // Doraemon Medium: 1.png, 2.png, ...
                        pieces: Array.from({length: 16}, (_, i) => `doremon/medium/${i + 1}.png`)
                    },
                    'hard': {
                        grid: 5,
                        // Doraemon Hard: 1.png, 2.png, ...
                        pieces: Array.from({length: 25}, (_, i) => `doremon/hard/${i + 1}.png`)
                    }
                }
            },
            'shinchan': {
                full: 'shinchan.jpg',
                difficulties: {
                    'easy': {
                        grid: 3,
                        pieces: Array.from({length: 9}, (_, i) => `shinchan/easy/shinchan.${i + 1}.png`)
                    },
                    'medium': {
                        grid: 4,
                        pieces: Array.from({length: 16}, (_, i) => `shinchan/medium/shinchan.${i + 1}.png`)
                    },
                    'hard': {
                        grid: 5,
                        pieces: Array.from({length: 25}, (_, i) => `shinchan/hard/shinchan.${i + 1}.png`)
                    }
                }
            },
            'oggy': {
                full: 'oggy.jpg',
                difficulties: {
                    'easy': {
                        grid: 3,
                        pieces: Array.from({length: 9}, (_, i) => `oggy/easy/oggy.${i + 1}.png`)
                    },
                    'medium': {
                        grid: 4,
                        pieces: Array.from({length: 16}, (_, i) => `oggy/medium/oggy.${i + 1}.png`)
                    },
                    'hard': {
                        grid: 5,
                        pieces: Array.from({length: 25}, (_, i) => `oggy/hard/oggy.${i + 1}.png`)
                    }
                }
            }
        };

        // ... (rest of your JavaScript functions remain the same) ...

        function drag(event) {
            if (!gameStarted) {
                event.preventDefault();
                return;
            }
            event.dataTransfer.setData("text", event.target.id);
        }

        function allowDrop(event) {
            if (!gameStarted) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
        }

        function drop(event) {
            if (!gameStarted) {
                event.preventDefault();
                return;
            }

            event.preventDefault();
            let data = event.dataTransfer.getData("text");
            let draggedElement = document.getElementById(data);

            if (!draggedElement) return;

            if (event.target.classList.contains('dropbox')) {
                if (event.target.children.length === 0) {
                    event.target.appendChild(draggedElement);
                } else {
                    let targetImage = event.target.children[0];
                    let draggedParent = draggedElement.parentNode;

                    draggedParent.appendChild(targetImage);
                    event.target.appendChild(draggedElement);
                }
            } else if (event.target.classList.contains('images')) {
                let targetImage = event.target;
                let draggedParent = draggedElement.parentNode;
                let targetParent = targetImage.parentNode;

                const tempPlaceholder = document.createElement('div');
                draggedParent.replaceChild(tempPlaceholder, draggedElement);
                targetParent.replaceChild(draggedElement, targetImage);
                tempPlaceholder.parentNode.replaceChild(targetImage, tempPlaceholder);
            }

            checkPuzzleSolved();
        }

        function loadPuzzlePieces(imageSetKey, difficulty) {
            selectedImageSetKey = imageSetKey;
            currentDifficulty = difficulty;
            currentGridSize = IMAGE_SETS[imageSetKey].difficulties[difficulty].grid;

            const dragContainer = document.getElementById('drag');
            const boardContainer = document.getElementById('board');
            const pieces = IMAGE_SETS[imageSetKey].difficulties[difficulty].pieces;
            const fullImageSrc = IMAGE_SETS[imageSetKey].full;

            dragContainer.innerHTML = ''; // Clear any existing pieces
            boardContainer.innerHTML = ''; // Clear any existing dropboxes

            // Set CSS Grid template columns dynamically
            dragContainer.style.gridTemplateColumns = `repeat(${currentGridSize}, 1fr)`;
            boardContainer.style.gridTemplateColumns = `repeat(${currentGridSize}, 1fr)`;

            const pieceSize = 300 / currentGridSize; // Adjust 300 based on your main grid size
            // Set individual piece and dropbox sizes based on currentGridSize
            document.documentElement.style.setProperty('--piece-size', `${pieceSize}px`);
            document.documentElement.style.setProperty('--grid-total-size', `${pieceSize * currentGridSize + (currentGridSize - 1) * 2}px`); // 2px gap

            // Create puzzle pieces
            pieces.forEach((pieceSrc, index) => {
                const div = document.createElement('div');
                div.classList.add('images', 'draggable');
                div.draggable = true;
                div.id = `block${index + 1}`;
                div.setAttribute('data-order', index + 1);
                div.style.setProperty('--img', `url(${pieceSrc})`);
                div.ondragstart = drag;
                dragContainer.appendChild(div);
            });

            // Create dropboxes
            for (let i = 1; i <= pieces.length; i++) {
                const dropbox = document.createElement('div');
                dropbox.classList.add('dropbox');
                dropbox.setAttribute('data-slot', i);
                dropbox.ondrop = drop;
                dropbox.ondragover = allowDrop;
                boardContainer.appendChild(dropbox);
            }

            document.getElementById('solvedFullImage').src = fullImageSrc;
        }

        function shuffleAndPrepare() {
            const parent = document.getElementById("drag");
            const frag = document.createDocumentFragment();
            // Important: Move pieces from board back to drag container before shuffling
            document.querySelectorAll('.dropbox').forEach(box => {
                while (box.children.length > 0) {
                    parent.appendChild(box.children[0]);
                }
            });

            // Now shuffle all pieces in the drag container
            while (parent.children.length > 0) {
                frag.appendChild(parent.children[Math.floor(Math.random() * parent.children.length)]);
            }
            parent.appendChild(frag);

            gameStarted = false;
            document.getElementById('startButton').style.display = 'inline-block';
            document.getElementById('resetButton').style.display = 'inline-block';
            document.getElementById('backToMenuButton').style.display = 'inline-block'; // Show back button
            document.getElementById('messageContainer').style.display = 'block';
            document.getElementById('congratulationsMsg').textContent = "Arrange the pieces to solve the puzzle.";
            document.getElementById('fullImageDisplay').style.display = 'none';
            document.getElementById('solvedFullImage').style.display = 'none';
            document.getElementById('board').style.display = 'grid'; // Ensure board is visible
            document.getElementById('drag').style.display = 'grid'; // Ensure drag box is visible

            // Clear board again after moving pieces to drag container
            document.querySelectorAll('.dropbox').forEach(box => {
                box.innerHTML = '';
            });

            document.querySelectorAll('.images').forEach(img => {
                img.draggable = false;
                img.style.cursor = 'not-allowed';
            });
            document.querySelectorAll('.dropbox').forEach(box => {
                box.ondrop = null;
                box.ondragover = null;
            });
        }

        function startGame() {
            gameStarted = true;
            document.getElementById('startButton').style.display = 'none';
            document.getElementById('messageContainer').style.display = 'none';

            document.querySelectorAll('.images').forEach(img => {
                img.draggable = true;
                img.style.cursor = 'grab';
            });
            document.querySelectorAll('.dropbox').forEach(box => {
                box.ondrop = drop;
                box.ondragover = allowDrop;
            });
        }

        function resetPuzzle() {
            // Re-load pieces with current settings to ensure they are available for shuffle
            loadPuzzlePieces(selectedImageSetKey, currentDifficulty);
            shuffleAndPrepare();
            document.getElementById('startButton').style.display = 'inline-block';
            document.getElementById('congratulationsMsg').textContent = "Arrange the pieces to solve the puzzle.";
            document.getElementById('messageContainer').style.display = 'block';
            document.getElementById('fullImageDisplay').style.display = 'none';
            document.getElementById('solvedFullImage').style.display = 'none';
            document.getElementById('board').style.display = 'grid';
            document.getElementById('drag').style.display = 'grid';
        }

        function checkPuzzleSolved() {
            const dropboxes = document.querySelectorAll('.dropbox');
            let solved = true;

            for (let i = 0; i < dropboxes.length; i++) {
                const dropbox = dropboxes[i];
                const expectedSlot = parseInt(dropbox.getAttribute('data-slot'));

                if (dropbox.children.length === 0) {
                    solved = false;
                    break;
                }

                const image = dropbox.children[0];
                const imageOrder = parseInt(image.getAttribute('data-order'));

                if (imageOrder !== expectedSlot) {
                    solved = false;
                    break;
                }
            }

            if (solved) {
                gameStarted = false;
                document.getElementById('congratulationsMsg').textContent = "Congratulations! Puzzle Solved!";
                document.getElementById('messageContainer').style.display = 'block';

                document.getElementById('board').style.display = 'none';
                document.getElementById('drag').style.display = 'none';
                
                const fullImage = document.getElementById('solvedFullImage');
                fullImage.style.display = 'block';
                document.getElementById('fullImageDisplay').style.display = 'flex';

                document.querySelectorAll('.images').forEach(img => img.draggable = false);
                document.querySelectorAll('.dropbox').forEach(box => {
                    box.ondrop = null;
                    box.ondragover = null;
                });
                document.getElementById('startButton').style.display = 'none';
            }
        }

        function showScreen(screenId) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.style.display = 'none';
            });
            document.getElementById('gameArea').style.display = 'none'; // Ensure game area is hidden too
            document.getElementById(screenId).style.display = 'flex'; // Use flex for centering screens
        }

        onload = function() {
            showScreen('imageSelectionScreen'); // Start with image selection

            document.querySelectorAll('.image-option').forEach(option => {
                option.addEventListener('click', function() {
                    selectedImageSetKey = this.getAttribute('data-image-set');
                    showScreen('difficultySelectionScreen');
                });
            });

            document.querySelectorAll('.difficulty-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const difficulty = this.getAttribute('data-difficulty');
                    loadPuzzlePieces(selectedImageSetKey, difficulty);
                    showScreen('gameArea');
                    document.getElementById('gameArea').style.display = 'flex'; // Make sure game area is flex
                    shuffleAndPrepare();
                });
            });

            document.getElementById('startButton').addEventListener('click', startGame);
            document.getElementById('resetButton').addEventListener('click', resetPuzzle);
            document.getElementById('backToMenuButton').addEventListener('click', function() {
                gameStarted = false;
                selectedImageSetKey = '';
                currentDifficulty = '';
                currentGridSize = 3; // Reset to default
                showScreen('imageSelectionScreen');
            });
        };