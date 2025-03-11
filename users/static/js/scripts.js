function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('profile-pic');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}



            document.addEventListener('DOMContentLoaded', function() {
                // Store profile data for auto-fill functionality
                const profileData = {
                    fullName: "{{ user.first_name }} {{ user.last_name }}" || "{{ user.username }}",
                    jobTitle: "{{ user.profile.position }}",
                    email: "{{ user.email }}",
                    phone: "{{ user.profile.phone }}",
                    bio: "{{ user.profile.bio }}",
                    location: "{{ user.profile.location }}",
                    hobbies: "{{ user.profile.hobbies }}",
                    institute: "{{ user.profile.insitute }}"
                };
                
                // Auto-fill from profile button handler
                document.getElementById('autoFillFromProfile').addEventListener('click', function() {
                    document.getElementById('fullName').value = profileData.fullName;
                    document.getElementById('jobTitle').value = profileData.jobTitle;
                    document.getElementById('email').value = profileData.email;
                    document.getElementById('phone').value = profileData.phone;
                    
                    // Create a professional summary from bio
                    document.getElementById('summary').value = profileData.bio;
                    
                    // Pre-fill the first education entry with institute if available
                    if (profileData.institute) {
                        const firstEducationEntry = document.querySelector('.education-entry');
                        firstEducationEntry.querySelector('.institution').value = profileData.institute;
                    }
                    
                    // Pre-fill the first experience entry with position if available
                    if (profileData.jobTitle) {
                        const firstExperienceEntry = document.querySelector('.experience-entry');
                        firstExperienceEntry.querySelector('.position').value = profileData.jobTitle;
                        firstExperienceEntry.querySelector('.location').value = profileData.location || '';
                    }
                    
                    // Pre-fill skills with hobbies if available
                    if (profileData.hobbies) {
                        document.getElementById('skills').value = profileData.hobbies.replace(/\s*,\s*/g, ', ');
                    }
                    
                    // Show a notification
                    showNotification('Form has been auto-filled with your profile data!');
                });
                
                // Function to show a temporary notification
                function showNotification(message) {
                    const notification = document.createElement('div');
                    notification.textContent = message;
                    notification.className = 'fixed top-4 right-4 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg';
                    document.body.appendChild(notification);
                    
                    // Remove after 3 seconds
                    setTimeout(() => {
                        notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                        setTimeout(() => {
                            document.body.removeChild(notification);
                        }, 500);
                    }, 3000);
                }
                
                // Add Education Entry
                document.getElementById('addEducation').addEventListener('click', function() {
                    const container = document.getElementById('educationContainer');
                    const entry = document.querySelector('.education-entry').cloneNode(true);
                    
                    // Clear inputs
                    entry.querySelectorAll('input').forEach(input => input.value = '');
                    
                    // Add remove button if it's not the first entry
                    if (container.children.length > 0) {
                        const removeBtn = document.createElement('button');
                        removeBtn.textContent = 'Remove';
                        removeBtn.className = 'mt-2 bg-red-500 text-white py-1 px-3 rounded';
                        removeBtn.addEventListener('click', function() {
                            container.removeChild(entry);
                        });
                        entry.appendChild(removeBtn);
                    }
                    
                    container.appendChild(entry);
                });
                
                // Add Experience Entry
                document.getElementById('addExperience').addEventListener('click', function() {
                    const container = document.getElementById('experienceContainer');
                    const entry = document.querySelector('.experience-entry').cloneNode(true);
                    
                    // Clear inputs
                    entry.querySelectorAll('input, textarea').forEach(input => input.value = '');
                    
                    // Add remove button if it's not the first entry
                    if (container.children.length > 0) {
                        const removeBtn = document.createElement('button');
                        removeBtn.textContent = 'Remove';
                        removeBtn.className = 'mt-2 bg-red-500 text-white py-1 px-3 rounded';
                        removeBtn.addEventListener('click', function() {
                            container.removeChild(entry);
                        });
                        entry.appendChild(removeBtn);
                    }
                    
                    container.appendChild(entry);
                });
                
                // Form Submission
                document.getElementById('resumeForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    generateResume();
                });
                
                // Generate Resume
                function generateResume() {
                    const fullName = document.getElementById('fullName').value;
                    const jobTitle = document.getElementById('jobTitle').value;
                    const email = document.getElementById('email').value;
                    const phone = document.getElementById('phone').value;
                    const summary = document.getElementById('summary').value;
                    const skills = document.getElementById('skills').value;
                    
                    // Get Education Entries
                    const educationEntries = [];
                    document.querySelectorAll('.education-entry').forEach(entry => {
                        educationEntries.push({
                            degree: entry.querySelector('.degree').value,
                            institution: entry.querySelector('.institution').value,
                            year: entry.querySelector('.year').value
                        });
                    });
                    
                    // Get Experience Entries
                    const experienceEntries = [];
                    document.querySelectorAll('.experience-entry').forEach(entry => {
                        experienceEntries.push({
                            position: entry.querySelector('.position').value,
                            company: entry.querySelector('.company').value,
                            duration: entry.querySelector('.duration').value,
                            location: entry.querySelector('.location').value,
                            responsibilities: entry.querySelector('.responsibilities').value
                        });
                    });
                    
                    // Build Resume HTML with inline styles for PDF generation
                    let resumeHTML = `
                        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.5;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${fullName}</h1>
                                <p style="font-size: 18px; margin: 5px 0;">${jobTitle}</p>
                                <p style="margin: 5px 0;">${email} | ${phone}</p>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <h2 style="font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px;">Professional Summary</h2>
                                <p style="margin-top: 5px;">${summary}</p>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <h2 style="font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px;">Education</h2>
                                <ul style="list-style-type: none; padding: 0; margin: 0;">
                    `;
                    
                    educationEntries.forEach(edu => {
                        resumeHTML += `
                            <li style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between;">
                                    <strong>${edu.degree}</strong>
                                    <span>${edu.year}</span>
                                </div>
                                <div>${edu.institution}</div>
                            </li>
                        `;
                    });
                    
                    resumeHTML += `
                                </ul>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <h2 style="font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px;">Work Experience</h2>
                                <ul style="list-style-type: none; padding: 0; margin: 0;">
                    `;
                    
                    experienceEntries.forEach(exp => {
                        resumeHTML += `
                            <li style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between;">
                                    <strong>${exp.position}</strong>
                                    <span>${exp.duration}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span>${exp.company}</span>
                                    <span>${exp.location}</span>
                                </div>
                                <p style="margin-top: 5px;">${exp.responsibilities}</p>
                            </li>
                        `;
                    });
                    
                    resumeHTML += `
                                </ul>
                            </div>
                            
                            <div>
                                <h2 style="font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px;">Skills</h2>
                                <p>${skills.split(',').map(skill => skill.trim()).join(' • ')}</p>
                            </div>
                        </div>
                    `;
                    
                    // Show preview with tailwind styling
                    const previewHTML = `
                        <div class="resume-container">
                            <div class="text-center mb-6">
                                <h1 class="text-2xl font-bold">${fullName}</h1>
                                <p class="text-lg">${jobTitle}</p>
                                <p>${email} | ${phone}</p>
                            </div>
                            
                            <div class="mb-6">
                                <h2 class="text-lg font-semibold border-b pb-1 mb-2">Professional Summary</h2>
                                <p>${summary}</p>
                            </div>
                            
                            <div class="mb-6">
                                <h2 class="text-lg font-semibold border-b pb-1 mb-2">Education</h2>
                                <ul class="list-none">
                    `;
                    
                    let previewEducation = '';
                    educationEntries.forEach(edu => {
                        previewEducation += `
                            <li class="mb-2">
                                <div class="flex justify-between">
                                    <strong>${edu.degree}</strong>
                                    <span>${edu.year}</span>
                                </div>
                                <div>${edu.institution}</div>
                            </li>
                        `;
                    });
                    
                    let previewExperience = '';
                    experienceEntries.forEach(exp => {
                        previewExperience += `
                            <li class="mb-4">
                                <div class="flex justify-between">
                                    <strong>${exp.position}</strong>
                                    <span>${exp.duration}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>${exp.company}</span>
                                    <span>${exp.location}</span>
                                </div>
                                <p class="mt-1">${exp.responsibilities}</p>
                            </li>
                        `;
                    });
                    
                    const fullPreviewHTML = previewHTML + previewEducation + `
                                </ul>
                            </div>
                            
                            <div class="mb-6">
                                <h2 class="text-lg font-semibold border-b pb-1 mb-2">Work Experience</h2>
                                <ul class="list-none">
                    ` + previewExperience + `
                                </ul>
                            </div>
                            
                            <div>
                                <h2 class="text-lg font-semibold border-b pb-1 mb-2">Skills</h2>
                                <p>${skills.split(',').map(skill => skill.trim()).join(' • ')}</p>
                            </div>
                        </div>
                    `;
                    
                    // Show preview
                    document.getElementById('resumeContent').innerHTML = fullPreviewHTML;
                    document.getElementById('resumePreview').classList.remove('hidden');
                    
                    // Set up PDF download using jsPDF
                    document.getElementById('downloadPdf').addEventListener('click', function() {
                        // Create container for PDF generation
                        const pdfContainer = document.getElementById('pdfContainer');
                        pdfContainer.innerHTML = resumeHTML;
                        pdfContainer.style.width = '800px';
                        pdfContainer.style.display = 'block';

                        // Initialize jsPDF
                        const { jsPDF } = window.jspdf;
                        
                        // Use html2canvas to convert the HTML to an image
                        html2canvas(pdfContainer, {
                            scale: 2, // Higher scale for better quality
                            useCORS: true,
                            logging: false,
                            letterRendering: true
                        }).then(canvas => {
                            // Create PDF
                            const pdf = new jsPDF('p', 'mm', 'a4');
                            const imgWidth = 210; // A4 width in mm
                            const pageHeight = 297; // A4 height in mm
                            const imgHeight = canvas.height * imgWidth / canvas.width;
                            let heightLeft = imgHeight;
                            let position = 0;
                            
                            // Add canvas as image to PDF
                            const imgData = canvas.toDataURL('image/png');
                            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                            heightLeft -= pageHeight;
                            
                            // Add new pages if the content overflows
                            while (heightLeft >= 0) {
                                position = heightLeft - imgHeight;
                                pdf.addPage();
                                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                                heightLeft -= pageHeight;
                            }
                            
                            // Download the PDF
                            pdf.save(`${fullName.replace(/\s+/g, '_')}_Resume.pdf`);
                            
                            // Clean up
                            pdfContainer.style.display = 'none';
                        });
                    });
                }
            });