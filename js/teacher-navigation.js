class TeacherNavigation {
    constructor() {
        this.currentPage = 'dashboard';
        // Đảm bảo DOM đã tải xong trước khi gọi các phương thức hiển thị
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeTeacherNavigation();
                this.displayTeacherName();
            });
        } else {
            this.initializeTeacherNavigation();
            this.displayTeacherName();
        }
    }

    initializeTeacherNavigation() {
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('href').substring(1);
                this.loadPage(page);
            });
        });

        // Load trang mặc định
        this.loadPage('dashboard');
    }

    async loadPage(page) {
        try {
            console.log('Loading page:', page); // Debug log
            const response = await fetch(`components/teacher-${page}-content.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            const mainContent = document.querySelector('#pageContent');
            if (mainContent) {
                mainContent.innerHTML = content;
                this.initializeComponent(page);
                this.updateActiveLink(page);
                this.currentPage = page;
            } else {
                console.error('Main content container not found');
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    }

    initializeComponent(page) {
        // Khởi tạo component tương ứng
        switch(page) {
            case 'dashboard':
                new TeacherDashboard();
                break;
            case 'scores':
                new TeacherScores();
                break;
            case 'schedule':
                new TeacherSchedule();
                break;
            case 'profile':
                new TeacherProfile();
                break;
        }
    }

    updateActiveLink(page) {
        // Cập nhật trạng thái active cho menu
        document.querySelectorAll('.sidebar li').forEach(li => {
            li.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar a[href="#${page}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }
    }

    // Phương thức để làm mới tất cả các trang
    refreshAllPages() {
        // Tải lại trang hiện tại
        this.loadPage(this.currentPage);
    }

    // Hiển thị tên giáo viên trong header
    async displayTeacherName() {
        const teacher = JSON.parse(sessionStorage.getItem('currentUser'));
        const teacherNameElement = document.getElementById('teacherName');
        
        console.log('Teacher data from sessionStorage:', teacher);
        
        if (teacher && teacherNameElement) {
            // Xóa tất cả nội dung hiện tại trong teacherName để tránh bị lặp
            teacherNameElement.innerHTML = '';
            
            // Tạo phần tử mới cho fullname
            const fullnameElement = document.createElement('span');
            fullnameElement.className = 'teacher-fullname';
            teacherNameElement.appendChild(fullnameElement);
            
            // Tạo phần tử mới cho role
            const roleElement = document.createElement('span');
            roleElement.className = 'teacher-role';
            teacherNameElement.appendChild(roleElement);
            
            console.log('Đã tạo lại các phần tử DOM:', { 
                teacherNameElement, 
                fullnameElement, 
                roleElement 
            });
            
            // Cập nhật tên giáo viên
            fullnameElement.textContent = `${teacher.lastName} ${teacher.firstName}`;
            console.log('Đã cập nhật tên giáo viên:', fullnameElement.textContent);
            
            // Cập nhật vai trò và môn học giáo viên 
            // Xác định môn học mặc định từ dữ liệu hiện có
            let subjectName = teacher.subjectName || "Math";
            console.log('Môn học từ session storage:', subjectName);
            
            // Kiểm tra xem có ID giáo viên không
            if (teacher.teacherId) {
                try {
                    console.log('Bắt đầu gọi API lấy danh sách môn học...');
                    // Khởi tạo DataService để lấy thông tin môn học
                    const dataService = new DataService('https://scoreapi-1zqy.onrender.com');
                    console.log('Teacher ID:', teacher.teacherId);
                    const subjectsData = await dataService.getTeacherSubjects(teacher.teacherId);
                    console.log('Dữ liệu môn học nhận được:', subjectsData);
                    
                    // Kiểm tra dữ liệu trả về và lấy tên môn học
                    if (subjectsData && Array.isArray(subjectsData) && subjectsData.length > 0) {
                        // Lấy môn học đầu tiên nếu có dữ liệu
                        if (subjectsData[0].subjectName) {
                            subjectName = subjectsData[0].subjectName;
                            console.log('Tìm thấy môn học:', subjectName);
                            
                            // Cập nhật thông tin giáo viên trong session storage
                            teacher.subjectName = subjectName;
                            sessionStorage.setItem('currentUser', JSON.stringify(teacher));
                        } else {
                            console.log('Không tìm thấy trường subjectName trong dữ liệu trả về');
                        }
                    } else {
                        console.log('Không có dữ liệu môn học hoặc dữ liệu không đúng định dạng');
                    }
                } catch (error) {
                    console.error('Lỗi khi lấy thông tin môn học:', error);
                }
            } else {
                console.warn('Không tìm thấy teacherId trong thông tin giáo viên');
            }
            
            // Hiển thị vai trò và môn học (dù có lỗi hay không)
            roleElement.textContent = `${subjectName} Teacher`;
            console.log('Đã cập nhật vai trò thành:', `${subjectName} Teacher`);
        } else {
            console.error('Không tìm thấy thông tin giáo viên hoặc phần tử DOM');
        }
    }
}


