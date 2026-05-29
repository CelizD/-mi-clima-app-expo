// importo react y los hooks que voy a usar
import React, { useEffect, useState } from "react";

// importo los componentes que voy a usar de react native
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// el tipo de dato de cada pokemon
type Pokemon = {
  id: number;
  nombre: string;
  apodo: string;
  foto: string;
  tipo: string;
};

// este es el componente principal de la pantalla
export default function CrudScreen() {
  // aqui guardo la lista de pokemons que viene de la api
  const [lista, setLista] = useState<Pokemon[]>([]);

  // para mostrar el loading mientras carga
  const [cargando, setCargando] = useState(false);

  // para abrir y cerrar el modal
  const [modalVisible, setModalVisible] = useState(false);

  // los campos del formulario
  const [nombre, setNombre] = useState("");
  const [apodo, setApodo] = useState("");

  // guardo el pokemon que estoy editando, si es null es porque estoy creando uno nuevo
  const [editando, setEditando] = useState<Pokemon | null>(null);

  // esto se ejecuta cuando carga la pantalla por primera vez
  useEffect(() => {
    // llamo a la funcion que trae los pokemons
    getPokemones();
  }, []); // el [] es para que solo se ejecute una vez

  // funcion para traer los pokemons de la api
  const getPokemones = async () => {
    // activo el loading
    setCargando(true);

    try {
      // hago la peticion a la pokeapi para traer 15 pokemons
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=15");

      // convierto la respuesta a json
      const data = await res.json();

      // aqui voy a guardar todos los pokemons con su detalle
      const resultado: Pokemon[] = [];

      // recorro cada pokemon de la lista
      for (let i = 0; i < data.results.length; i++) {
        // hago otra peticion para traer el detalle de cada pokemon
        const r = await fetch(data.results[i].url);
        const info = await r.json();

        // armo el objeto con los datos que necesito y lo agrego al array
        resultado.push({
          id: info.id,
          nombre: info.name,
          apodo: info.name, // por defecto el apodo es el mismo nombre
          foto: info.sprites.front_default, // la imagen del pokemon
          tipo: info.types[0].type.name, // solo tomo el primer tipo
        });
      }

      // guardo todos los pokemons en el estado
      setLista(resultado);
    } catch {
      // si hay un error muestro una alerta
      Alert.alert("Error", "No se pudo cargar");
    }

    // desactivo el loading cuando termina
    setCargando(false);
  };

  // funcion para agregar un nuevo pokemon a la lista
  const agregar = () => {
    // valido que los campos no esten vacios
    if (nombre === "" || apodo === "") {
      Alert.alert("Llena todos los campos");
      return; // salgo de la funcion si esta vacio
    }

    // creo el objeto del nuevo pokemon
    const nuevo: Pokemon = {
      id: Date.now(), // uso la fecha como id unico para que no se repita
      nombre: nombre,
      apodo: apodo,
      foto: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png", // uso la imagen de ditto
      tipo: "normal",
    };

    // agrego el nuevo pokemon al inicio de la lista
    setLista([nuevo, ...lista]);

    // limpio los campos del formulario
    setNombre("");
    setApodo("");

    // cierro el modal
    setModalVisible(false);
  };

  // funcion para guardar los cambios cuando edito un pokemon
  const guardarEdicion = () => {
    // tambien valido que no esten vacios
    if (nombre === "" || apodo === "") {
      Alert.alert("Llena todos los campos");
      return;
    }

    // recorro la lista y cuando encuentro el pokemon que estoy editando lo actualizo
    const nuevaLista = lista.map((p) => {
      if (p.id === editando?.id) {
        // retorno el pokemon con los nuevos datos
        return { ...p, nombre: nombre, apodo: apodo };
      }
      // si no es el que busco lo retorno igual
      return p;
    });

    // actualizo la lista con los cambios
    setLista(nuevaLista);

    // limpio el estado de edicion
    setEditando(null);
    setNombre("");
    setApodo("");

    // cierro el modal
    setModalVisible(false);
  };

  // funcion para eliminar un pokemon de la lista
  const eliminar = (id: number) => {
    // muestro una alerta de confirmacion antes de eliminar
    Alert.alert("Eliminar", "¿Seguro?", [
      { text: "No" }, // si presiona no no hace nada
      {
        text: "Si",
        onPress: () => {
          // filtro la lista y quito el pokemon con ese id
          const nueva = lista.filter((p) => p.id !== id);
          setLista(nueva);
        },
      },
    ]);
  };

  // funcion para abrir el modal en modo edicion
  const abrirModalEditar = (item: Pokemon) => {
    // guardo el pokemon que voy a editar
    setEditando(item);

    // cargo los datos del pokemon en los campos del formulario
    setNombre(item.nombre);
    setApodo(item.apodo);

    // abro el modal
    setModalVisible(true);
  };

  // funcion para abrir el modal en modo creacion
  const abrirModalNuevo = () => {
    // limpio el estado de edicion porque es uno nuevo
    setEditando(null);

    // limpio los campos
    setNombre("");
    setApodo("");

    // abro el modal
    setModalVisible(true);
  };

  // este es el componente que se muestra por cada pokemon en la lista
  const renderItem = ({ item }: { item: Pokemon }) => {
    return (
      // tarjeta del pokemon
      <View style={styles.card}>
        {/* imagen del pokemon */}
        <Image source={{ uri: item.foto }} style={{ width: 60, height: 60 }} />

        {/* informacion del pokemon */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.apodo}</Text>
          <Text style={{ color: "gray" }}>{item.nombre}</Text>
          <Text style={{ color: "gray", fontSize: 12 }}>{item.tipo}</Text>
        </View>

        {/* botones de editar y eliminar */}
        <View>
          {/* boton para editar */}
          <TouchableOpacity
            onPress={() => abrirModalEditar(item)}
            style={{
              backgroundColor: "#ddf",
              padding: 6,
              borderRadius: 6,
              marginBottom: 5,
            }}
          >
            <Text>✏️</Text>
          </TouchableOpacity>

          {/* boton para eliminar */}
          <TouchableOpacity
            onPress={() => eliminar(item.id)}
            style={{ backgroundColor: "#fdd", padding: 6, borderRadius: 6 }}
          >
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // aqui es lo que se muestra en pantalla
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* encabezado de la pantalla */}
      <View
        style={{
          backgroundColor: "red",
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          Mi Pokedex
        </Text>

        {/* boton para agregar nuevo pokemon */}
        <TouchableOpacity
          onPress={abrirModalNuevo}
          style={{ backgroundColor: "white", padding: 8, borderRadius: 20 }}
        >
          <Text style={{ color: "red", fontWeight: "bold" }}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* si esta cargando muestro el spinner, si no muestro la lista */}
      {cargando ? (
        <ActivityIndicator size="large" color="red" style={{ marginTop: 40 }} />
      ) : (
        // la flatlist es como un scroll con los pokemons
        <FlatList
          data={lista} // le paso la lista de pokemons
          keyExtractor={(item) => String(item.id)} // el id tiene que ser string
          renderItem={renderItem} // le digo como renderizar cada item
          contentContainerStyle={{ padding: 10 }}
        />
      )}

      {/* modal para crear o editar un pokemon */}
      <Modal visible={modalVisible} transparent animationType="slide">
        {/* fondo oscuro detras del modal */}
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          {/* contenido del modal */}
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            {/* titulo del modal cambia dependiendo si es crear o editar */}
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}
            >
              {editando ? "Editar Pokemon" : "Nuevo Pokemon"}
            </Text>

            {/* campo para el nombre */}
            <Text>Nombre:</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={(text) => setNombre(text)}
              placeholder="nombre del pokemon"
            />

            {/* campo para el apodo */}
            <Text>Apodo:</Text>
            <TextInput
              style={styles.input}
              value={apodo}
              onChangeText={(text) => setApodo(text)}
              placeholder="apodo"
            />

            {/* botones de cancelar y guardar */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 15 }}>
              {/* boton cancelar cierra el modal */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#eee",
                  padding: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              {/* boton guardar llama a agregar o guardarEdicion segun el caso */}
              <TouchableOpacity
                onPress={editando ? guardarEdicion : agregar}
                style={{
                  flex: 1,
                  backgroundColor: "red",
                  padding: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {editando ? "Guardar" : "Crear"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// los estilos de los componentes
const styles = StyleSheet.create({
  // estilo de la tarjeta de cada pokemon
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row", // para que quede en fila
    alignItems: "center",
  },
  // estilo del input de texto
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    marginTop: 4,
  },
});
