module.exports = (type, options) => {
  const mapInfo = {
    'reset-pass': {
      title: 'T-Courses - Reset your password',
      content: `Mình vừa nhận được yêu cầu thay đổi mật khẩu của bạn, để thay đổi mật khẩu của mình, nhấn vào nút bên dưới nha!<br><br>
      <div style="width: 100%; padding: 12px 0; text-align: center">
        <a style="text-decoration: none; padding: 8px 10px; color: white; font-weight: bold; text-transform: uppercase; background-color: #8b00cc; border-radius: 4px; box-sizing: border-box;" href="${options.uri}${options.token}">Cập nhật mật khẩu</a>
      </div>
      <i>Hoặc có thể bấm vào <a style="text-decoration: none; font-weight: bold" href="${options.uri}${options.token}">đây</a> nếu nút trên kia bị lỗi.</i><br>
      <br>
      Nếu bạn không làm gì cả, thì đừng lo, tài khoản bạn vẫn không sao cả, bạn có thể bỏ qua email này của mình.<br>`,
    },
    'active-account': {
      title: 'T-Courses - Active your account.',
      content: `Bạn vừa tạo tài khoản trên <b>Hệ thống học lập trình trực tuyến T-Courses</b>.<br>
      Để có thể sử dụng mọi chức năng của hệ thống, bạn cần xác thực địa chỉ email của mình bằng cách nhấn vào nút bên dưới.<br>
      <br>
      <div style="width: 100%; padding: 12px 0; text-align: center">
        <a style="text-decoration: none; padding: 8px 10px; color: white; font-weight: bold; text-transform: uppercase; background-color: #8b00cc; border-radius: 4px; box-sizing: border-box;" href="${options.uri}${options.token}">Xác thực tài khoản</a>
      </div>
      <br>
      <i>Hoặc có thể bấm vào <a style="text-decoration: none; font-weight: bold" href="${options.uri}${options.token}">đây</a> trong trường hợp nút trên kia bị lỗi.</i><br>
      <br>
      Cảm ơn bạn đã sử dụng hệ thống của mình!`,
    },
    'notify': {},
    'invite-course': {
      title: 'T-Courses - Join to course',
      content: `Bạn vừa được mời vào một khóa học nào đó!<br>
      Mã truy cập là:<br><b style="break-word: break-all">21312312312</b><br>
      `
    },
    'invite-course-text': {
      title: 'T-Courses - Join to course',
      content: `Bạn vừa được mời vào một khóa học nào đó!\r\n
      Mã truy cập là: ${options.token}
      `
    },
  }
  return mapInfo[type];
};
