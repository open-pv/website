const BackgroundMesh = ({ geometries, deletedBackgroundMeshes }) => {
  return (
    <>
      {geometries.map(
        (geometry, index) =>
          !deletedBackgroundMeshes.includes(`BackgroundMesh-${index}`) && (
            <mesh
              key={index}
              geometry={geometry}
              name={`BackgroundMesh-${index}`}
            >
              <meshLambertMaterial
                color={0xcccccc}
                transparent={true}
                opacity={0.3}
              />
            </mesh>
          )
      )}
    </>
  )
}

export default BackgroundMesh
