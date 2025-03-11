// <!-- Add this to your existing JavaScript section -->
    function toggleNotePanel() {
        const notePanel = document.getElementById('notePanel');
        if (notePanel.classList.contains('hidden')) {
            notePanel.classList.remove('hidden');
            document.getElementById('noteText').focus();
        } else {
            notePanel.classList.add('hidden');
        }
    }
    
    function clearNote() {
        document.getElementById('noteText').value = '';
    }
    
    function generateIdea() {
        const noteText = document.getElementById('noteText');
        const selectedText = window.getSelection().toString();
            
        // If text is selected in the chat, use that as inspiration
        // Otherwise use any text in the note field
        const prompt = selectedText || noteText.value || "Need inspiration";
            
        // Show a temporary "generating" message
        noteText.value = "Thinking about question...";
            
        // Use the same API endpoint you're already using for chat
        fetch("{% url 'ai-home' %}", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": "{{ csrf_token }}"
            },
            body: JSON.stringify({ 
                question: "Please provide a brief, structured response (max 3 short bullet points) about: " + prompt,
                is_note: true
            })
        })
        .then(response => response.json())
        .then(data => {
            // Format the response
            let formattedResponse = formatNoteResponse(data.answer || "No response received");
            
            // Update the note area with the structured response
            noteText.value = formattedResponse;
        })
        .catch(error => {
            console.error("Error:", error);
            noteText.value = "Error answering question. Please try again.";
        });
    }
    
    // Function to format the AI response into a clean, structured note
    function formatNoteResponse(response) {
        // Remove markdown formatting if present
        let cleanResponse = response
            .replace(/#{1,6}\s/g, '') // Remove headings
            .replace(/\*\*/g, '')     // Remove bold markers
            .replace(/\*/g, '')       // Remove italic markers
            .replace(/`/g, '')        // Remove code markers
            .trim();
            
        // Check if the response already has bullet points
        if (cleanResponse.includes('- ')) {
            // It has bullet points, ensure proper formatting
            let points = cleanResponse.split('\n')
                .filter(line => line.trim().length > 0)
                .map(line => {
                    // Standardize bullet points and limit line length
                    return line.trim().startsWith('- ') 
                        ? line.trim() 
                        : '- ' + line.trim();
                });
                
            // Limit to 3 bullet points maximum
            if (points.length > 3) {
                points = points.slice(0, 3);
            }
            
            return points.join('\n');
        } else {
            // No bullet points, create structured format
            // Split by sentences or paragraphs
            let sentences = cleanResponse
                .replace(/([.!?])\s+/g, "$1\n")
                .split('\n')
                .filter(s => s.trim().length > 0);
                
            // Limit to 3 points
            if (sentences.length > 3) {
                sentences = sentences.slice(0, 3);
            }
            
            // Format as bullet points
            return sentences
                .map(s => '- ' + s.trim())
                .join('\n');
        }
    }


    // ==============================================




    