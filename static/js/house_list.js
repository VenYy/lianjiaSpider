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


// 点击搜索候选区将其填入输入框
function click_to_input() {
    $(".suggest_item").on("click", function () {
        $("#filter_by_input").val("")
        $("#filter_by_input").val($(this).attr("title"))
    })
}

$(document).ready(function () {
    const search_input = document.getElementById("filter_by_input")
    // 设置锁，true表示锁住输入框，false表示解锁输入框
    var cpLock = false;
    // 中文搜索，监听compositionstart事件，如果触发该事件，就锁住输入框
    $('#filter_by_input').on('compositionstart', function () {
        cpLock = true;
    });

    // 中文搜索，监听compositionend事件，如果触发该事件，就解锁输入框
    $('#filter_by_input').on('compositionend', function () {
        cpLock = false;
        const keyWord = search_input.value;
        search_suggest(keyWord)
    });

    // 英文搜索，监听input事件，用于处理字母搜索
    $('#filter_by_input').on('input', function () {
        if (!cpLock) {
            var keyWord = search_input.value;
            search_suggest(keyWord);
        }
    });
})


