const BackgroundMesh = ({ geometries }) => {
  return (
    <>
      {geometries.map((geometry, index) => (
        <mesh geometry={geometry} name={`BackgroundMesh-${index}`}>
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
