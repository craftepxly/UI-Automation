describe('OrangeHRM E2E - Tugas 3', () => {
    // Test data untuk Admin dan Employee
    const adminCredentials = {
      username: 'Admin',
      password: 'admin123'
    };
  
    const newEmployee = {
      firstName: 'John',
      middleName: 'William',
      lastName: 'Doe',
      employeeId: '12345',
      // Kredensial untuk akun karyawan baru
      username: 'johndoe',
      password: 'P@ssw0rd123',
      confirmPassword: 'P@ssw0rd123'
    };
  
    // Data untuk kasus negatif
    const invalidNewEmployee = {
      firstName: '',  // Nama kosong untuk kasus negatif
      middleName: '',
      lastName: '',
      employeeId: '',
      username: 'johndoe',
      password: 'weak',  // Password lemah untuk kasus negatif
      confirmPassword: 'weak'
    };
  
    // Data untuk pengujian cuti
    const leaveData = {
      leaveType: 'Vacation US',
      fromDate: '2025-06-01',
      toDate: '2025-06-03',
      comment: 'Annual vacation'
    };
  
    // Data untuk kasus negatif pengajuan cuti
    const invalidLeaveData = {
      leaveType: 'Vacation US',
      fromDate: '2025-06-01',
      toDate: '2025-05-28',  // Tanggal akhir sebelum tanggal mulai (kasus negatif)
      comment: 'Invalid date range'
    };
  
    beforeEach(() => {
      // Kunjungi halaman login untuk setiap pengujian
      cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
      cy.url().should('include', '/auth/login');
    });
  
    // Fungsi helper untuk login
    function login(username, password) {
      cy.get('input[name="username"]').clear().type(username);
      cy.get('input[name="password"]').clear().type(password);
      cy.get('button[type="submit"]').click();
      
      // Verifikasi login berhasil
      cy.get('.oxd-topbar-header-title').should('exist');
    }
  
    // Fungsi helper untuk logout
    function logout() {
      cy.get('.oxd-userdropdown-tab').click();
      cy.contains('Logout').click();
      cy.url().should('include', '/auth/login');
    }
  
    // ========== 1. MENAMBAHKAN KARYAWAN BARU ==========
    
    it('Positive Case: Menambahkan karyawan baru dan membuat akun', () => {
      // Langkah 1: Login sebagai Admin
      login(adminCredentials.username, adminCredentials.password);
      
      // Langkah 2: Tambah karyawan di menu PIM
      cy.contains('PIM').click();
      cy.contains('Add Employee').click();
      
      // Isi formulir karyawan baru
      cy.get('input[name="firstName"]').type(newEmployee.firstName);
      cy.get('input[name="middleName"]').type(newEmployee.middleName);
      cy.get('input[name="lastName"]').type(newEmployee.lastName);
      
      // Hapus employeeId yang ada dan tambahkan yang baru
      cy.get('.oxd-grid-item > .oxd-input-group > :nth-child(2) > .oxd-input').clear().type(newEmployee.employeeId);
      
      // Aktifkan opsi Create Login Details
      cy.get('.oxd-switch-input').click();
      
      // Isi detail login karyawan
      cy.get(':nth-child(4) > .oxd-grid-2 > :nth-child(1) > .oxd-input-group > :nth-child(2) > .oxd-input').type(newEmployee.username);
      cy.get('.user-password-cell > .oxd-input-group > :nth-child(2) > .oxd-input').type(newEmployee.password);
      cy.get('.oxd-grid-2 > :nth-child(2) > .oxd-input-group > :nth-child(2) > .oxd-input').type(newEmployee.confirmPassword);
      
      // Simpan data karyawan
      cy.get('button[type="submit"]').click();
      
      // Assertion: Verifikasi karyawan berhasil ditambahkan
      cy.contains('Successfully Saved', { timeout: 10000 }).should('be.visible');
      cy.contains(newEmployee.firstName + ' ' + newEmployee.lastName).should('be.visible');
      
      // Logout setelah selesai
      logout();
    });
  
    it('Negative Case: Menambahkan karyawan baru dengan data tidak valid', () => {
      // Langkah 1: Login sebagai Admin
      login(adminCredentials.username, adminCredentials.password);
      
      // Langkah 2: Tambah karyawan di menu PIM
      cy.contains('PIM').click();
      cy.contains('Add Employee').click();
      
      // Isi formulir karyawan dengan data tidak valid (kosong)
      cy.get('input[name="firstName"]').clear();
      cy.get('input[name="lastName"]').clear();
      
      // Aktifkan opsi Create Login Details
      cy.get('.oxd-switch-input').click();
      
      // Isi detail login dengan password lemah
      cy.get(':nth-child(4) > .oxd-grid-2 > :nth-child(1) > .oxd-input-group > :nth-child(2) > .oxd-input').type(invalidNewEmployee.username);
      cy.get('.user-password-cell > .oxd-input-group > :nth-child(2) > .oxd-input').type(invalidNewEmployee.password);
      cy.get('.oxd-grid-2 > :nth-child(2) > .oxd-input-group > :nth-child(2) > .oxd-input').type(invalidNewEmployee.confirmPassword);
      
      // Coba simpan data karyawan
      cy.get('button[type="submit"]').click();
      
      // Assertion: Verifikasi error message untuk field yang wajib diisi
      cy.contains('Required').should('be.visible');
      
      // Assertion: Verifikasi error message untuk password lemah
      cy.contains('Should have at least 7 characters').should('be.visible');
      
      // Logout setelah selesai
      logout();
    });
  
    // ========== 2. MENAMBAHKAN JATAH CUTI UNTUK KARYAWAN BARU ==========
    
    it('Positive Case: Menambahkan jatah cuti untuk karyawan baru', () => {
      // Langkah 1: Login sebagai Admin
      login(adminCredentials.username, adminCredentials.password);
      
      // Langkah 2: Tambahkan cuti untuk karyawan baru
      cy.contains('Leave').click();
      cy.contains('Entitlements').click();
      cy.contains('Add Entitlements').click();
      
      // Pilih karyawan
      cy.get('.oxd-autocomplete-text-input > input').type(newEmployee.firstName + ' ' + newEmployee.lastName);
      cy.wait(1000); // Tunggu hasil autocomplete
      cy.get('.oxd-autocomplete-dropdown > *').first().click();
      
      // Pilih Leave Type
      cy.get('.oxd-select-text').click();
      cy.contains('Vacation US').click();
      
      // Isi Entitlement
      cy.get('.oxd-input--active').clear().type('10');
      
      // Simpan Entitlement
      cy.get('button[type="submit"]').click();
      
      // Konfirmasi di popup
      cy.get('.oxd-button--secondary').contains('Confirm').click();
      
      // Assertion: Verifikasi cuti berhasil ditambahkan
      cy.contains('Successfully Saved', { timeout: 10000 }).should('be.visible');
      
      // Lihat daftar entitlement
      cy.contains('Employee Entitlements').click();
      
      // Cari karyawan untuk memverifikasi entitlement
      cy.get('.oxd-autocomplete-text-input > input').type(newEmployee.firstName + ' ' + newEmployee.lastName);
      cy.wait(1000); // Tunggu hasil autocomplete
      cy.get('.oxd-autocomplete-dropdown > *').first().click();
      cy.get('button[type="submit"]').click();
      
      // Assertion: Verifikasi entitlement muncul di tabel
      cy.contains(newEmployee.firstName + ' ' + newEmployee.lastName).should('be.visible');
      cy.contains('Vacation US').should('be.visible');
      cy.contains('10.00').should('be.visible');
      
      // Logout setelah selesai
      logout();
    });
  
    it('Negative Case: Menambahkan jatah cuti dengan nilai negatif', () => {
      // Langkah 1: Login sebagai Admin
      login(adminCredentials.username, adminCredentials.password);
      
      // Langkah 2: Tambahkan cuti untuk karyawan baru
      cy.contains('Leave').click();
      cy.contains('Entitlements').click();
      cy.contains('Add Entitlements').click();
      
      // Pilih karyawan
      cy.get('.oxd-autocomplete-text-input > input').type(newEmployee.firstName + ' ' + newEmployee.lastName);
      cy.wait(1000); // Tunggu hasil autocomplete
      cy.get('.oxd-autocomplete-dropdown > *').first().click();
      
      // Pilih Leave Type
      cy.get('.oxd-select-text').click();
      cy.contains('Vacation US').click();
      
      // Isi Entitlement dengan nilai negatif
      cy.get('.oxd-input--active').clear().type('-5');
      
      // Simpan Entitlement
      cy.get('button[type="submit"]').click();
      
      // Assertion: Verifikasi pesan error untuk nilai cuti negatif
      cy.contains('Should be a positive number').should('be.visible');
      
      // Logout setelah selesai
      logout();
    });
  
    // ========== 3. KARYAWAN BARU REQUEST CUTI ==========
    
    it('Positive Case: Karyawan request cuti dan Admin approve', () => {
      // Langkah 1: Login sebagai karyawan baru
      login(newEmployee.username, newEmployee.password);
      
      // Langkah 2: Request cuti
      cy.contains('Leave').click();
      cy.contains('Apply').click();
      
      // Pilih Leave Type
      cy.get('.oxd-select-text').click();
      cy.contains(leaveData.leaveType).click();
      
      // Isi tanggal mulai dan selesai
      cy.get('.oxd-date-input').eq(0).click();
      cy.get('.oxd-calendar-date').contains('1').click(); // Pilih tanggal 1
      
      cy.get('.oxd-date-input').eq(1).click();
      cy.get('.oxd-calendar-date').contains('3').click(); // Pilih tanggal 3
      
      // Isi komentar
      cy.get('.oxd-textarea').type(leaveData.comment);
      
      // Submit request cuti
      cy.get('button[type="submit"]').click();
      
      // Assertion: Verifikasi cuti berhasil diajukan
      cy.contains('Successfully Saved', { timeout: 10000 }).should('be.visible');
      
      // Periksa status cuti di My Leave
      cy.contains('My Leave').click();
      cy.contains(leaveData.leaveType).should('be.visible');
      cy.contains('Pending Approval').should('be.visible');
      
      // Logout dari akun karyawan
      logout();
      
      // Langkah 3: Login sebagai Admin
      login(adminCredentials.username, adminCredentials.password);
      
      // Langkah 4: Approve cuti pegawai
      cy.contains('Leave').click();
      cy.contains('Leave List').click();
      
      // Cari cuti karyawan
      cy.get('.oxd-form').should('be.visible');
      cy.get('.oxd-autocomplete-text-input > input').type(newEmployee.firstName + ' ' + newEmployee.lastName);
      cy.wait(1000); // Tunggu hasil autocomplete
      cy.get('.oxd-autocomplete-dropdown > *').first().click();
      
      // Submit pencarian
      cy.get('button[type="submit"]').click();
      
      // Approve cuti
      cy.contains('Pending Approval').should('be.visible');
      cy.get('.oxd-table-cell-actions').find('.bi-check').first().click();
      
      // Verifikasi approval berhasil
      cy.contains('Successfully Updated').should('be.visible');
      
      // Logout dari akun admin
      logout();
      
      // Langkah 5: Login sebagai karyawan
      login(newEmployee.username, newEmployee.password);
      
      // Langkah 6: Expect cuti di approve
      cy.contains('Leave').click();
      cy.contains('My Leave').click();
      
      // Assertion: Verifikasi status cuti sudah approved
      cy.contains(leaveData.leaveType).should('be.visible');
      cy.contains('Scheduled').should('be.visible');
      
      // Logout setelah selesai
      logout();
    });
  
    it('Negative Case: Karyawan request cuti dengan tanggal tidak valid', () => {
      // Langkah 1: Login sebagai karyawan baru
      login(newEmployee.username, newEmployee.password);
      
      // Langkah 2: Request cuti dengan tanggal tidak valid
      cy.contains('Leave').click();
      cy.contains('Apply').click();
      
      // Pilih Leave Type
      cy.get('.oxd-select-text').click();
      cy.contains(invalidLeaveData.leaveType).click();
      
      // Isi tanggal mulai (1 Juni 2025)
      cy.get('.oxd-date-input').eq(0).click();
      cy.get('.oxd-calendar-date').contains('1').click();
      
      // Coba isi tanggal selesai yang sudah lewat (kasus negatif)
      // Karena tidak bisa langsung mengatur tanggal yang sudah lewat melalui UI,
      // kita akan menggunakan input kosongkan dulu kemudian ketik manual
      cy.get('.oxd-date-input').eq(1).find('input').clear().type('2025-05-28{enter}');
      
      // Isi komentar
      cy.get('.oxd-textarea').type(invalidLeaveData.comment);
      
      // Submit request cuti
      cy.get('button[type="submit"]').click();
      
      // Assertion: Verifikasi pesan error tentang tanggal tidak valid
      cy.contains('To date should be after From date').should('be.visible');
      
      // Logout setelah selesai
      logout();
    });
  });