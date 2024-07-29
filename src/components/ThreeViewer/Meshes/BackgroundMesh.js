const BackgroundMesh = ({ geometries }) => {
  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} name={`BackgroundMesh-${index}`}>
          <meshLambertMaterial
            color={0xcccccc}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      ))}
    </>
  )
}

export default BackgroundMesh
