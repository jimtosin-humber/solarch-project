const apiUrl = "https://buiev5yyql.execute-api.us-east-1.amazonaws.com/prod/";
const apiUrlCors = "https://cors-anywhere.herokuapp.com/https://buiev5yyql.execute-api.us-east-1.amazonaws.com/prod/";

function loadPagination(group,totalPages) {
    var pagination = document.getElementById('pagination');
    
    try {
        let pageStart=1;
        let left_arrow_onclick = "";
        let right_arrow_onclick = "";
        
        if (group % 5 === 0) {
            pageStart = group - 4;
        }
        else {
            pageStart = group - (group % 5) + 1;
        }

        let html = '<a href="#catalog" onclick="displayGroup(1)" class="w3-bar-item w3-button w3-hover-black">«</a>';
        if (group > 5) {
            left_arrow_onclick = `displayGroup(${pageStart-1})`;
        }
        else {
            left_arrow_onclick = `displayGroup(1)`;
        }
        html += `<a href="#catalog" onclick="${left_arrow_onclick}" class="w3-bar-item w3-button w3-hover-black">‹</a>`;

        for(let i = pageStart; i < pageStart + 5; i++) {
            if (i > totalPages) {
                break;
            }
            if (i === group){
                html += `<a href="#catalog" id="currentGroup" class="w3-bar-item w3-button w3-black">${i}</a>`;
            }
            else {
                html += `<a href="#catalog" onclick="displayGroup(${i})" class="w3-bar-item w3-button w3-hover-black">${i}</a>`;
            }
        }

        if (group < totalPages-5) {
            right_arrow_onclick = `displayGroup(${pageStart+5})`;
        }
        else {
            right_arrow_onclick = `displayGroup(${totalPages})`;
        }
        html += `<a href="#catalog" onclick="${right_arrow_onclick}" class="w3-bar-item w3-button w3-hover-black">›</a>`;
        html += `<a href="#catalog" onclick="displayGroup(${totalPages})" class="w3-bar-item w3-button w3-hover-black">»</a>`;

        pagination.innerHTML = html;
        pagination.style.display = "inline-block";
    }
    catch (error) {
        console.error("Error fetching data:", error);
        pagination.innerHTML = error;
    }
};


async function getAlbumCover(album,artist) {
    var mbApi = `https://musicbrainz.org/ws/2/release/?query=artist:${artist}%20AND%20release=${album}`
    let mbResponse = await fetch(mbApi);
    let mbData = await mbResponse.text();
    let parser = new DOMParser();
    let albumXml = parser.parseFromString(mbData, "text/xml");
    let mbid = albumXml.getElementsByTagName('release')[0].id;
    var coverApi = `http://coverartarchive.org/release/${mbid}`;
    let coverResponse = await fetch(coverApi);
    let coverData = await coverResponse.json();
    let imageURL = coverData.images[0].image;
    return imageURL;
}


async function displayGroup(group) {
    var pageItems = 12;
    var sortSelect = document.getElementById('sortSelect');
    var getApiUrl = `${apiUrl}albums/groups/${group}/${pageItems}/${sortSelect.value}/`;
    var toolbar = document.getElementById('toolbar');
    var albumDiv = document.getElementById('albumDiv');
    var sortButton = document.getElementById('sortButton');
    var searchBar = document.getElementById('searchBar');

    if (searchBar.value) {
        getApiUrl += `${searchBar.value}/`;
    }
    

    if (sortButton.classList.contains('fa-arrow-down-wide-short')) {
        getApiUrl += "desc/";
    }
    
    try {
        let getResponse = await fetch(getApiUrl);
        let getData = await getResponse.json();
        let data = JSON.parse(getData.body);
        let albums = data.group;
        let albumTotal = data.count;
        let totalPages = Math.ceil(albumTotal / pageItems);

        if (albumTotal) {
            let html = '<div class="w3-row-padding">';
            let albumTitle = "";
            let artistName = "";
            let genres = [];
            let genreString = "";
            let albumNameInFunction = "";

            albums.forEach((album, index) => {
                if (album.Album.length > 25) {
                    albumTitle = album.Album.substring(0, 25) + "...";
                }
                else {
                    albumTitle = album.Album;
                }

                if (album.Artist.length > 35) {
                    artistName = album.Artist.substring(0, 35) + "...";
                }
                else {
                    artistName = album.Artist;
                }
                
                let albumCoverURL = getAlbumCover(album.Album, album.Artist);
                albumNameInFunction = album.Album.replace("'","\\'").replace('"','\"').replace('"','');
                genreString = "";
                genres = album.Genre.split(", ");
                genres.forEach((genre, genreIndex) => {
                    if (genreIndex < 3) {
                        genreString += genre + ", ";
                    }
                });
                if (genres.length > 3) {
                    genreString += "etc.";
                }
                else {
                    genreString = album.Genre;
                }
                if (index % 4 === 0 && index > 0) {
                    html += "</div><div class='w3-row-padding'>";
                }
                html += `<div class="w3-quarter w3-container w3-margin-bottom">
                            <div class="w3-container w3-white">
                                <div style="display:flex">
                                    <div style="width:80%">
                                        <p><b>${albumTitle}</b></p>
                                    </div>
                                    <div style="display:block;float:right">    
                                        <p><i class="fa fa-ranking-star w3-text-amber" style="margin-right:8px"></i>${album.Rank}</p>
                                    </div>
                                </div>
                                <p>${artistName}</p>
                                <p style="margin-bottom:0px">${genreString}</p>
                                <div style="margin-top:0px;padding:0px;display:flex">
                                    <div style="width:300px">
                                        <p>${album.Year}</p>
                                    </div>
                                    <div style="display:flex">
                                        <div>
                                            <h5><i class="fa fa-edit w3-button w3-padding-small w3-text-teal w3-hover-opacity" onclick="displayEditPage('${albumNameInFunction}',${album.Year},'${album.Artist}','${album.Genre}',${album.Rank})"></i></h5>
                                        </div>
                                        <div>
                                            <h5><i class="fa fa-trash w3-button w3-padding-small w3-text-red w3-hover-opacity" onclick="deleteAlbum('${albumNameInFunction}',${album.Year})"></i></h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
            });
            html += '</div>';
            albumDiv.innerHTML = html;
            toolbar.style.display = "flex";
            loadPagination(group,totalPages);
        }
        else {
            let noneFoundHtml = '<div class="w3-container"><h3>Search Result: No albums found.</h3></div>';
            albumDiv.innerHTML = noneFoundHtml;
            pagination.style.display = "none";
        }
    }
    catch (error) {
        console.error("Error fetching data:", error);
        albumDiv.innerHTML = error;
    }
};


function toggleSort() {
    var sortButton = document.getElementById('sortButton');
    if (sortButton.classList.contains('fa-arrow-up-wide-short')) {
        sortButton.classList.remove('fa-arrow-up-wide-short');
        sortButton.classList.add('fa-arrow-down-wide-short');
    }
    else {
        sortButton.classList.remove('fa-arrow-down-wide-short');
        sortButton.classList.add('fa-arrow-up-wide-short');
    }
    let currentGroup = parseInt(document.getElementById('currentGroup').innerHTML);
    parent.displayGroup(currentGroup);
};


function loadPageListeners() {
    sortSelect = document.getElementById('sortSelect');
    searchBar = document.getElementById('searchBar');

    sortSelect.addEventListener('change', function() {
        let currentGroup = parseInt(document.getElementById('currentGroup').innerHTML);
        displayGroup(currentGroup);
    });

    searchBar.addEventListener('input', function() {
        let currentGroup = parseInt(document.getElementById('currentGroup').innerHTML);
        displayGroup(currentGroup);
    });
};

window.addEventListener("load", loadPageListeners, false);


function displayAddPage() {
    var albumDiv = document.getElementById('albumDiv');
    var pagination = document.getElementById('pagination');
    var toolbar = document.getElementById('toolbar');

    var xhr= new XMLHttpRequest();
    xhr.open('GET', 'form.html', true);
    xhr.onreadystatechange= function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return;
        var formHtml = this.responseText;
        albumDiv.innerHTML= formHtml;
    };
    xhr.send();

    pagination.innerHTML = "";
    toolbar.style.display = "none";
}


function displayEditPage(album,year,artist,genre,rank) {
    var albumDiv = document.getElementById('albumDiv');
    var pagination = document.getElementById('pagination');
    var toolbar = document.getElementById('toolbar');

    var xhr= new XMLHttpRequest();
    xhr.open('GET', 'form.html', true);
    xhr.onreadystatechange= function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return;
        let html = this.responseText.replace('placeholder="Album"', `value="${album}" disabled`).replace('placeholder="Year"', `value=${year} disabled`);
        html = html.replace('placeholder="Artist"', `placeholder="Artist" value="${artist}"`).replace('placeholder="Genre(s)"', `placeholder="Genre(s)" value="${genre}"`).replace('placeholder="Rank"', `placeholder="Rank" value=${rank}`);
        albumDiv.innerHTML= html;
    };
    xhr.send();

    pagination.innerHTML = "" ;
    toolbar.style.display = "none";
}


async function addAlbum() { // also used for edit
    const addApiUrl = `${apiUrlCors}albums/add/`;

    // Get form values
    var album = document.getElementById('album').value;
    var artist = document.getElementById('artist').value;
    var genre = document.getElementById('genre').value;
    var year = document.getElementById('year').value;
    var rank = document.getElementById('rank').value;
    
    // Construct API call object
    var albumData = {
        body: {
            Album: album,
            Artist: artist,
            Genre: genre,
            Year: parseInt(year),
            Rank: parseInt(rank)
        }  
    };

    // Make API call
    try {
        var addResponse = await fetch(addApiUrl,{
            method: 'POST',
            headers: {
                'x-requested-with': 'XMLHttpRequest'
            },
            body: JSON.stringify(albumData)
        });
        var addData = await addResponse.json();
        let respDetails = addData.body;
        alert(`Successfully added/modified album - ${album} (${year})`);
        parent.displayGroup(1);
    }
    catch (error) {
        alert(error);
    };
}


async function deleteAlbum(album,year) {
    const delApiUrl = `${apiUrlCors}albums/delete/`;
    var delConfirm = confirm(`Are you sure you want to delete ${album} (${year})?`);
    
    // Construct API call object
    var albumData = {
        pathParameters: {
            album: album,
            year: parseInt(year)
        }
    };

    // Make API call
    if (delConfirm) {
        try {
            var delResponse = await fetch(delApiUrl,{
                method: 'POST',
                headers: {
                    'x-requested-with': 'XMLHttpRequest'
                },
                body: JSON.stringify(albumData)
            });
            var delData = await delResponse.json();
            let respDetails = JSON.stringify(delData.body);
            alert(`Successfully deleted album - ${album} (${year})`);
            let currentGroup = parseInt(document.getElementById('currentGroup').innerHTML);
            parent.displayGroup(currentGroup);
        }
        catch (error) {
            alert(error);
        };
    }
}