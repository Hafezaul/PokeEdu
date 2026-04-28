    const form = document.getElementById("searchForm");
    const input = document.getElementById("pokemonInput");
    const message = document.getElementById("message");
    const card = document.getElementById("pokemonCard");
    const previousBtn = document.getElementById("previousBtn");
    const nextBtn = document.getElementById("nextBtn");

    let currentPokemonId = 25;

    const pokemonImage = document.getElementById("pokemonImage");
    const pokemonId = document.getElementById("pokemonId");
    const pokemonName = document.getElementById("pokemonName");
    const pokemonTypes = document.getElementById("pokemonTypes");
    const pokemonSummary = document.getElementById("pokemonSummary");
    const height = document.getElementById("height");
    const weight = document.getElementById("weight");
    const totalStats = document.getElementById("totalStats");
    const pokemonAbilities = document.getElementById("pokemonAbilities");
    const pokemonStats = document.getElementById("pokemonStats");

    const statNames = {
      hp: "HP",
      attack: "Attack",
      defense: "Defense",
      "special-attack": "Sp. Atk",
      "special-defense": "Sp. Def",
      speed: "Speed"
    };

    const typeExplanations = {
      normal: "seimbang dalam pertarungan umum",
      fire: "kuat dengan serangan api dan damage agresif",
      water: "andal menyerang sekaligus bertahan dengan elemen air",
      electric: "unggul dalam kecepatan dan serangan listrik",
      grass: "kuat dalam serangan alam dan efek status",
      ice: "berbahaya dengan serangan es untuk memperlambat lawan",
      fighting: "kuat dalam pertarungan fisik jarak dekat",
      poison: "mampu melemahkan musuh dengan racun",
      ground: "tangguh dengan serangan tanah yang berat",
      flying: "lincah dan kuat dalam mobilitas udara",
      psychic: "unggul dengan kekuatan mental dan serangan spesial",
      bug: "cepat berkembang dan efektif dengan teknik serang unik",
      rock: "kuat secara pertahanan dan serangan batu",
      ghost: "licin, misterius, dan sulit diserang secara biasa",
      dragon: "sangat kuat dengan potensi serangan besar",
      dark: "cerdik dengan taktik gelap dan serangan kejutan",
      steel: "sangat kokoh dalam pertahanan",
      fairy: "efektif melawan ancaman besar seperti dragon"
    };

    function showMessage(text) {
      message.style.display = "block";
      card.style.display = "none";
      message.textContent = text;
    }

    function setNavigationDisabled(isDisabled) {
      previousBtn.disabled = isDisabled || currentPokemonId <= 1;
      nextBtn.disabled = isDisabled;
    }

    function createTags(container, items) {
      container.innerHTML = "";
      items.forEach((item) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = item.replaceAll("-", " ");
        container.appendChild(span);
      });
    }

    function buildPowerSummary(pokemon, speciesText) {
      const types = pokemon.types.map((item) => item.type.name);
      const bestStat = [...pokemon.stats].sort((a, b) => b.base_stat - a.base_stat)[0];
      const typePower = types.map((type) => typeExplanations[type] || `memiliki karakteristik tipe ${type}`).join(", dan ");
      const abilityList = pokemon.abilities.map((item) => item.ability.name.replaceAll("-", " ")).join(", ");

      return `${capitalize(pokemon.name)} bertipe ${types.join(" / ")}, sehingga ia ${typePower}. Stat terkuatnya adalah ${statNames[bestStat.stat.name] || bestStat.stat.name} dengan nilai ${bestStat.base_stat}. Ability yang dimiliki: ${abilityList}. ${speciesText}`;
    }

    function capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function cleanFlavorText(entries) {
      const englishEntry = entries.find((entry) => entry.language.name === "en");
      if (!englishEntry) return "Data deskripsi resmi belum tersedia untuk Pokémon ini.";
      return englishEntry.flavor_text.replace(/[\n\f]/g, " ");
    }

    async function fetchPokemon(query) {
      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
      if (!pokemonResponse.ok) throw new Error("Pokémon tidak ditemukan.");
      const pokemon = await pokemonResponse.json();

      const speciesResponse = await fetch(pokemon.species.url);
      const species = await speciesResponse.json();

      return { pokemon, species };
    }

    function renderPokemon(pokemon, species) {
      currentPokemonId = pokemon.id;
      input.value = pokemon.name;
      setNavigationDisabled(false);
      const image =
        pokemon.sprites.other?.["official-artwork"]?.front_default ||
        pokemon.sprites.other?.dream_world?.front_default ||
        pokemon.sprites.front_default;

      const types = pokemon.types.map((item) => item.type.name);
      const abilities = pokemon.abilities.map((item) => item.ability.name);
      const statsTotal = pokemon.stats.reduce((sum, item) => sum + item.base_stat, 0);
      const speciesText = cleanFlavorText(species.flavor_text_entries);

      pokemonImage.src = image;
      pokemonImage.alt = `Gambar ${pokemon.name}`;
      pokemonId.textContent = `#${String(pokemon.id).padStart(4, "0")}`;
      pokemonName.textContent = pokemon.name;
      createTags(pokemonTypes, types);
      pokemonSummary.textContent = buildPowerSummary(pokemon, speciesText);

      height.textContent = `${pokemon.height / 10} m`;
      weight.textContent = `${pokemon.weight / 10} kg`;
      totalStats.textContent = statsTotal;

      createTags(pokemonAbilities, abilities);

      pokemonStats.innerHTML = "";
      pokemon.stats.forEach((item) => {
        const row = document.createElement("div");
        row.className = "stat-row";
        const percentage = Math.min((item.base_stat / 180) * 100, 100);

        row.innerHTML = `
          <span>${statNames[item.stat.name] || item.stat.name}</span>
          <div class="bar"><div class="bar-fill" style="width: ${percentage}%"></div></div>
          <strong>${item.base_stat}</strong>
        `;

        pokemonStats.appendChild(row);
      });

      message.style.display = "none";
      card.style.display = "grid";
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const query = input.value.trim().toLowerCase();

      if (!query) {
        showMessage("Masukkan nama atau ID Pokémon terlebih dahulu.");
        return;
      }

      showMessage("Mencari data Pokémon...");

      try {
        setNavigationDisabled(true);
        const { pokemon, species } = await fetchPokemon(query);
        renderPokemon(pokemon, species);
      } catch (error) {
        showMessage("Pokémon tidak ditemukan. Coba nama lain, misalnya pikachu, bulbasaur, atau charizard.");
      }
    });

    async function goToPokemon(id) {
      if (id < 1) return;

      showMessage("Mencari data Pokémon...");
      setNavigationDisabled(true);

      try {
        const { pokemon, species } = await fetchPokemon(id);
        renderPokemon(pokemon, species);
      } catch (error) {
        showMessage("Gagal memuat Pokémon. Coba lagi nanti.");
        setNavigationDisabled(false);
      }
    }

    previousBtn.addEventListener("click", () => {
      goToPokemon(currentPokemonId - 1);
    });

    nextBtn.addEventListener("click", () => {
      goToPokemon(currentPokemonId + 1);
    });

    setNavigationDisabled(true);

    fetchPokemon("pikachu")
      .then(({ pokemon, species }) => renderPokemon(pokemon, species))
      .catch(() => showMessage("Ketik nama Pokémon untuk mulai mencari."));