-- Create partial unique index to ensure only one accepted supervision request per student
CREATE UNIQUE INDEX unique_student_accepted_request 
ON "supervision_requests" (student_id) 
WHERE request_state = 'ACCEPTED';