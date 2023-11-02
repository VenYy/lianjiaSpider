document.addEventListener("DOMContentLoaded", function () {
    // 监听页面滚动事件
    window.addEventListener('scroll', function () {
        var backToTopBtn = document.getElementById('back_to_top');

        // 如果页面不在最顶部，显示返回顶部按钮，否则隐藏按钮
        if (window.pageYOffset > 500) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

// 点击返回顶部按钮时，滚动到页面最顶部
    document.getElementById('back_to_top').addEventListener('click', function () {
        // 使用平滑滚动效果，滚动到页面顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });



})


