function saveClothes() {

    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;
    const memo = document.getElementById("memo").value;

    const clothes = {
        category,
        status,
        memo
    };

    let closet =
        JSON.parse(localStorage.getItem("closet")) || [];

    closet.push(clothes);

    localStorage.setItem(
        "closet",
        JSON.stringify(closet)
    );

    location.href = "closet.html";
}